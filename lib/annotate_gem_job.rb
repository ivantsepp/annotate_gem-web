require "resque"
require "resque/status"
require "annotate_gem"
require "tempfile"

Resque::Plugins::Status::Hash.expire_in = (24 * 60 * 60) # 24hrs in seconds

class AnnotateGemJob
  include Resque::Plugins::Status

  def perform
    file = Tempfile.new("Gemfile")
    file.write(options['content'])
    file.rewind
    file.close
    gemfile = AnnotateGem::Gemfile.new(file.path)
    gemfile.parse
    unless gemfile.gem_lines.empty?
      AnnotateGem::SpecFinder.find_specs_for(gemfile.gem_lines) do |completed, total|
        at(completed, total, "At #{completed} of #{total}")
      end
      gemfile.write_comments
    end

    output = File.read(file.path)
    file.unlink
    completed('output' => output)
  end
end
