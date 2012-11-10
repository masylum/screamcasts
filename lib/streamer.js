var Streamer = {}
  , windows = require('./windows')
  , url = require('url')
  , querystring = require('querystring')
  , hexbase64 = require('../client/hexbase64')
  , fs = require('fs');

function getParam(req, str) {
  var url_parts = url.parse(req.url, true)
    , query = url_parts.query;

  return query[str];
}

function getPostParam(req, str, cb) {
  var body = '';

  req.on('data', function (data) {
    body += data;
  });

  req.on('end', function () {
    cb(null, querystring.parse(body)[str]);
  });
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
    , data_b64, data_buffer, window;

  data_b64 = getPostParam(req, 'data', function (err, data_b64) {
    if (err) return res.end(err);
    if (!data_b64) return res.end('No data');

    data_buffer = new Buffer(data_b64, 'base64');
    window = windows.findOrCreate(window_id);
    window.pipe(data_buffer);
    res.writeHead(200);
    res.end('Done :)');
  });
};

module.exports = Streamer;
