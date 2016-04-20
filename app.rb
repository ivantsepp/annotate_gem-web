require "sinatra/base"
require "grub"
require "tempfile"
require "coderay"
require "sinatra/asset_pipeline"

require_relative "lib/grub_job"

class GrubApp < Sinatra::Base
  set :assets_precompile,  %w(application.css application.js)
  set :assets_prefix, %w(assets)
  set :assets_css_compressor, :sass
  set :assets_js_compressor, :uglifier
  register Sinatra::AssetPipeline

  get "/" do
    erb :index
  end

  post "/" do
    textarea = params[:"gemfile-textarea"]
    upload = params[:"gemfile-upload"]
    if (textarea.nil? || textarea.empty?) && (upload.nil? || upload.empty?)
      @error_message = "Need Gemfile either from a file or from contents pasted in textarea"
      return erb :index
    end
    if upload && upload[:tempfile]
      file = upload[:tempfile]
    else
      file = Tempfile.new("Gemfile")
      file.write(textarea)
    end
    path = file.path
    file.close
    content = File.read(path)
    @job_id = GrubJob.create(content: content)
    puts @job_id
    file.unlink
    erb :index
  end

  get "/result/:id" do
    content_type :json
    status = Resque::Plugins::Status::Hash.get(params[:id])
    status["output_html"] = CodeRay.scan(status['output'], :ruby).div if status.completed?
    status["percentage"] = status.pct_complete
    status.to_json
  end
end
