var Streamer = {}
  , windows = require('./windows')
  , url = require('url')
  , querystring = require('querystring')
  , hexbase64 = require('../client/hexbase64')
  //, gif = require('../shared/gif')
  , fs = require('fs');

GLOBAL._ = require('../vendor/underscore');
require('../shared/gif');

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
    , data = Gif.encode(100, 100, 16)
    , subscription_id = window.subscribe(res);

  res.writeHead(200, {'Content-Type': 'image/gif'});
  res.write(new Buffer(data.join(''), 'hex'));

  req.on('close', function () {
    console.log('close');
    window.unsubscribe(subscription_id);
  });
};

Streamer.capture = function (req, res) {
  var window_id = getParam(req, 'window_id')
    , data_buffer, window;

  getPostParam(req, 'data', function (err, data) {
    if (err) return res.end(err);
    if (!data) return res.end('No data');

    data_buffer = new Buffer(data, 'base64');
    window = windows.findOrCreate(window_id);
    window.pipe(data_buffer);
    res.writeHead(200);
    res.end('Done :)');
  });
};

module.exports = Streamer;
