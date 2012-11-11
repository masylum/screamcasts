var WindowManager = {storage: {}}
  , util = require('util')
  , Stream = require('stream')
  , now = Date.now()
  , id = 0;

function WindowStream(win_id) {
  this.id = win_id;
  this.subscribers = [];
}

WindowStream.prototype.subscribe = function (res) {
  return this.subscribers.push(res) - 1;
};

WindowStream.prototype.unsubscribe = function (index) {
  delete this.subscribers[index];
};

WindowStream.prototype.write = function (buf) {
  this.subscribers.forEach(function (sub) {
    console.log('write', buf.length, Date.now() - now);
    now = Date.now();
    sub.write(buf);
  });
};

WindowStream.prototype.end = function (buf) {
  this.subscribers.forEach(function (sub) {
    sub.end(buf);
  });
};

WindowManager.find = function (win_id) {
  return WindowManager.storage[win_id];
};

WindowManager.destroy = function (win_id) {
  delete WindowManager.storage[win_id];
};

WindowManager.findOrCreate = function (win_id) {
  var win;

  if (WindowManager.find(win_id)) {
    return WindowManager.storage[win_id];
  } else {
    win = new WindowStream(win_id);
    WindowManager.storage[win.id] = win;
    return win;
  }
};

module.exports = WindowManager;
