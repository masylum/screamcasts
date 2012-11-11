var WindowManager = {storage: {}}
  , util = require('util')
  , Stream = require('stream')
  , subscribers = []
  , id = 0;

function createWindowStream(win_id) {
  var window_stream = new Stream()
    , bytes = 0;

  window_stream.id = win_id;
  window_stream.writable = true;
  window_stream.readable = true;

  window_stream.write = function (buf) {
    bytes += buf.length;
    window_stream.emit('data', buf);
  };

  window_stream.end = function (buf) {
    if (arguments.length) {
      window_stream.write(buf);
    }

    window_stream.writable = false;
  };

  window_stream.destroy = function () {
    window_stream.writable = false;
  };

  return window_stream;
}

WindowManager.find = function (win_id) {
  return WindowManager.storage[win_id];
};

WindowManager.destroy = function (win_id) {
  WindowManager.find(win_id).destroy();
  delete WindowManager.storage[win_id];
};

WindowManager.findOrCreate = function (win_id) {
  var win;

  if (WindowManager.find(win_id)) {
    return WindowManager.storage[win_id];
  } else {
    win = createWindowStream(win_id);
    WindowManager.storage[win.id] = win;
    return win;
  }
};

module.exports = WindowManager;
