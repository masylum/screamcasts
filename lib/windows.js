var WindowManager = {storage: {}}
  , subscribers = []
  , id = 0;

function Window(win_id) {
  this.id = win_id || id++;
}

Window.prototype.subscribe = function (res) {
  subscribers.push(res);
  return subscribers.length - 1;
};

Window.prototype.unsubscribe = function (subscription_id) {
  delete subscribers[subscription_id];
};

Window.prototype.pipe = function (data) {
  subscribers.forEach(function (res) {
    res.write(data);
  });
};

WindowManager.findOrCreate = function (win_id) {
  var win;

  if (WindowManager.storage[win_id]) {
    return WindowManager.storage[win_id];
  } else {
    win = new Window(win_id);
    WindowManager.storage[win.id] = win;
    return win;
  }
};

module.exports = WindowManager;
