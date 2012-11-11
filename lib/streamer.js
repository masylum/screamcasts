/*globals Gif*/
var Streamer = {}
  , windows = require('./windows')
  , url = require('url')
  , querystring = require('querystring')
  , fs = require('fs');

GLOBAL._ = require('../assets/javascripts/underscore.min');
require('../assets/javascripts/gif');

Streamer.stream = function (window_id, req, res) {
  var window = windows.find(window_id)
    , index
    , data = Gif.encode(100, 100, 16);

  if (!window) {
    console.log('no window: ' + window_id);
    res.writeHead(200, {'Content-Type': 'image/gif'});
    fs.createReadStream(__dirname + '/../assets/images/window-not-found.gif').pipe(res);
    return;
  }

  res.writeHead(200, {'Content-Type': 'image/gif'});
  res.write(new Buffer(data.join(''), 'hex'));

  index = window.subscribe(res);
  console.log('subscribe', Object.keys(window.subscribers));

  req.on('close', function () {
    window.unsubscribe(index);
    console.log('unsubscribe', Object.keys(window.subscribers));
    window.end(new Buffer(Gif.trailer[0], 'hex'));
  });
};

setInterval(function () {
  console.log(Object.keys(windows.storage));
}, 5 * 1000);

Streamer.capture = function (req, res) {
  var window_id = req.param('id')
    , data = req.param('data')
    , data_buffer
    , now = Date.now()
    , window = windows.findOrCreate(window_id);

  clearTimeout(window.timeout);
  window.timeout = setTimeout(function () {
    console.log('timeout: ' + window_id);
    window.end(new Buffer(Gif.trailer, 'hex'));
    windows.destroy(window.id);
  }, 5 * 1000); // 5 s

  if (!data) {
    res.writeHead(500);
    res.end('No data');
    return;
  }

  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end('{}');

  data_buffer = new Buffer(data, 'base64');
  window.write(data_buffer);
};

module.exports = Streamer;
