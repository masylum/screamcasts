/*global io*/

var socket = io.connect(location.origin);

function joinChat(window_id) {
  document.window_id = window_id;
  $("#chat").show();
  socket.emit("join", window_id);
  console.log("Joining chat at " + window_id);
}

socket.on('connect', function () {
  var match = location.pathname.match(/^\/v\/(\S+)$/i);
  if (match) {
    joinChat(match[1]);
  }
});

// Receive message: add it to the log and scroll down
socket.on('message', function (m) {
  // Avoid my own join message
  if ($("#log p").length === 0 && m.type === "join") {
    return;
  }
  $("#log").append($("<p>").text(m.msg));
  $("#log").scrollTop(10000000000);
});

$(function () {
  $("textarea").focus().keypress(function (e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      socket.emit("message", { msg: $(e.target).val(), window_id: document.window_id });
      $(e.target).val('').focus();
    }
  });

  $("textarea").focus().keyup(function (e) {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  });
});
