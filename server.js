var streamer = require('./lib/streamer')
  , server = require('./lib/server');

var http = require('http')
  , url = require('url');

http.createServer(function (req, res) {
  var path = url.parse(req.url).pathname
    , read_stream;

  if (path === '/data.gif') {
    streamer.stream(req, res);
  } else if (path === '/capture') {
    streamer.capture(req, res);
  } else {
    // not safe!
    read_stream = require('fs').createReadStream(__dirname + require('url').parse(req.url).pathname);
    read_stream.on('error', function () {
      console.log(__dirname + require('url').parse(req.url).pathname, ' not found: who cares?');
    });
    read_stream.pipe(res);
  }
}).listen(3000);

