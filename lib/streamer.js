var Streamer = {}
  , windows = require('./windows')
  , url = require('url')
  , hexbase64 = require('../client/hexbase64')
  , fs = require('fs');

function getParam(req, str) {
  var url_parts = url.parse(req.url, true)
    , query = url_parts.query;

  return query[str];
}

Streamer.stream = function (req, res) {
  var window_id = getParam(req, 'window_id')
    , window = windows.findOrCreate(window_id)
    , subscription_id = window.subscribe(res);

  res.writeHead(200, {'Content-Type': 'image/gif'});

  req.on('close', function () {
    window.unsubscribe(subscription_id);
  });
};

Streamer.capture = function (req, res) {
  var window_id = getParam(req, 'window_id')
    , data_b64 = getParam(req, 'data')
    , data_buffer = new Buffer(data_b64, 'base64')
    , window = windows.findOrCreate(window_id);

  window.pipe(data_buffer);
};

module.exports = Streamer;
