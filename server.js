var streamer = require('./lib/streamer')
  , http = require('http')
  , url = require('url')
  , fs = require('fs');

http.createServer(function (req, res) {
  var path = url.parse(req.url).pathname
    , read_stream;

  if (path === '/data.gif') {
    streamer.stream(req, res);
  } else if (path === '/') {
    fs.createReadStream(__dirname + '/home.html').pipe(res);
  } else if (path === '/view') {
    fs.createReadStream(__dirname + '/view.html').pipe(res);
  } else if (path === '/capture') {
    streamer.capture(req, res);
  } else {
    // not safe!
    // TODO: Add HTTP caching headers to images
    read_stream = fs.createReadStream(__dirname + url.parse(req.url).pathname);
    read_stream.on('error', function () {
      res.end('not found');
      console.log(__dirname + url.parse(req.url).pathname, ' not found: who cares?');
    });
    read_stream.pipe(res);
  }
}).listen(3000);
