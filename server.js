var streamer = require('./lib/streamer')
  , server = require('./lib/server');

server.start(streamer, 3000);
