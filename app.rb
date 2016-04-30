require "sinatra/base"
require "annotate_gem"
require "tempfile"
require "coderay"
require "sinatra/asset_pipeline"

require_relative "lib/annotate_gem_job"

class AnnotateGemApp < Sinatra::Base
  set :assets_precompile,  %w(application.css application.js)
  set :assets_prefix, %w(assets)
  set :assets_css_compressor, :sass
  set :assets_js_compressor, :uglifier
  register Sinatra::AssetPipeline

  get "/" do
    erb :index
  end

  post "/" do
    text = params[:"gemfile-text"]
    textarea = params[:"gemfile-textarea"]
    upload = params[:"gemfile-upload"]
    if (text.nil? || text.empty?) && (textarea.nil? || textarea.empty?) && (upload.nil? || upload.empty?)
      @error_message = "Need Gemfile either from a Github link, from a file, or from contents pasted in textarea"
      return erb :index
    end
    if upload && upload[:tempfile]
      file = upload[:tempfile]
    else
      file = Tempfile.new("Gemfile")
      if text && !text.empty?
        if text =~ /\A[\w.-]+\/[\w.-]+\z/
          github_gemfile =  Net::HTTP.get(URI("https://raw.githubusercontent.com/#{text}/master/Gemfile"))
          if github_gemfile == "Not Found"
            @error_message = "Did not find a Gemfile for #{text}"
            return erb :index
          else
            file.write(github_gemfile)
          end
        else
          @error_message = "Invalid GitHub owner and repo. Please use the format `owner/repo`."
          return erb :index
        end
      else
        file.write(textarea)
      end
    end
    path = file.path
    file.close
    content = File.read(path)
    @job_id = AnnotateGemJob.create(content: content)
    puts @job_id
    file.unlink
    erb :index
  end

  get "/result/:id" do
    content_type :json
    status = Resque::Plugins::Status::Hash.get(params[:id])
    return status 404 if status.nil?
    status["output_html"] = CodeRay.scan(status['output'], :ruby).div if status.completed?
    status["percentage"] = status.pct_complete
    status.to_json
  end
end
