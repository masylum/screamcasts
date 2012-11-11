/*globals Gif*/
var Streamer = {}
  , windows = require('./windows')
  , url = require('url')
  , querystring = require('querystring')
  , fs = require('fs');

GLOBAL._ = require('../assets/javascripts/underscore.min');
require('../assets/javascripts/gif');

function destroy(window) {
  window.end(new Buffer(Gif.trailer, 'hex'));
  windows.destroy(window.id);
}

Streamer.stream = function (window_id, req, res) {
  var window = windows.find(window_id)
    , data = Gif.encode(100, 100, 16);

  if (!window) {
    console.log('no window: ' + window_id);
    res.writeHead(200, {'Content-Type': 'image/gif'});
    fs.createReadStream(__dirname + '/../assets/images/window-not-found.gif').pipe(res);
    return;
  }

  res.writeHead(200, {'Content-Type': 'image/gif'});
  res.write(new Buffer(data.join(''), 'hex'));

  window.pipe(res);

  req.on('close', function () {
    destroy(window);
  });
};

Streamer.capture = function (req, res) {
  var window_id = req.param('id')
    , data = req.param('data')
    , data_buffer
    , now = Date.now()
    , window = windows.findOrCreate(window_id);

  clearTimeout(window.interval);
  window.interval = setTimeout(function () {
    destroy(window);
  }, 10 * 2000); // 2 s

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
