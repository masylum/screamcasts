var http = require('http')
  , url = require('url');

module.exports.start = function server(streamer, port) {
  http.createServer(function (req, res) {
    var path = url.parse(req.url).pathname;
    if (path === '/data.gif') {
      streamer.stream(req, res);
    } else if (path === '/capture') {
      streamer.capture(req, res);
    }
  }).listen(port);
};
