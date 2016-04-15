require "sinatra/base"
require "grub"
require "tempfile"
require "coderay"
require "bundler"

class GrubApp < Sinatra::Base
  get "/" do
    @html = CodeRay.scan("puts 'Hello, world!'", :ruby)
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
    gemfile = Grub::Gemfile.new(path)
    gemfile.parse
    unless gemfile.gem_lines.empty?
      Grub::SpecFinder.find_specs_for(gemfile.gem_lines)
      gemfile.write_comments
    end
    @output = File.read(path)
    @output_html = CodeRay.scan(@output, :ruby).div
    file.unlink
    erb :index
  end
end