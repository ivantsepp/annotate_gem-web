require "resque"
require "resque/status"
require "grub"
require "tempfile"

Resque::Plugins::Status::Hash.expire_in = (24 * 60 * 60) # 24hrs in seconds

class GrubJob
  include Resque::Plugins::Status

  def perform
    file = Tempfile.new("Gemfile")
    file.write(options['content'])
    file.rewind
    file.close
    gemfile = Grub::Gemfile.new(file.path)
    gemfile.parse
    unless gemfile.gem_lines.empty?
      Grub::SpecFinder.find_specs_for(gemfile.gem_lines)
      gemfile.write_comments
    end

    output = File.read(file.path)
    file.unlink
    completed('output' => output)
    # total.times do |i|
    #   num = i+1
    #   at(num, total, "At #{num} of #{total}")
    #   sleep(1)
    # end
  end
end
