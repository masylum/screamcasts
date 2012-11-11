/*globals Gif*/
var Streamer = {}
  , windows = require('./windows')
  , url = require('url')
  , querystring = require('querystring')
  , hexbase64 = require('../client/hexbase64')
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

Streamer.stream = function (window_id, req, res) {
  var window = windows.find(window_id)
    , data = Gif.encode(100, 100, 16);

  if (!window) {
    console.log('no window');
    res.writeHead(200, {'Content-Type': 'image/gif'});
    fs.createReadStream(__dirname + '/../assets/images/window-not-found.gif').pipe(res);
    return;
  }

  res.writeHead(200, {'Content-Type': 'image/gif'});
  res.write(new Buffer(data.join(''), 'hex'));

  window.pipe(res);
  window.on('data', function () {
    console.log('data');
  });

  req.on('close', function () {
    console.log('close');
    window.end(new Buffer(Gif.trailer, 'hex'));
  });
};

Streamer.capture = function (req, res) {
  var window_id = getParam(req, 'window_id')
    , window = windows.findOrCreate(window_id);

  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end('{}');

  getPostParam(req, 'data', function (err, data) {
    var data_buffer;

    if (err) return res.end(err);
    if (!data) return res.end('No data');

    data_buffer = new Buffer(data, 'base64');
    window.write(data_buffer);
  });
};

module.exports = Streamer;
