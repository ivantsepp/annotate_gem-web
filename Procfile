web: bundle exec rackup config.ru -p $PORT
resque: env QUEUE=* TERM_CHILD=1 bundle exec rake resque:work
