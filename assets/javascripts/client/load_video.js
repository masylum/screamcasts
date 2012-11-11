$(function () {

  // Load GIF from the path

  // Paths like /v/7h9zKE
  var match = location.pathname.match(/\/v\/([a-z0-9]+)/i);

  if (match[1]) {
    var $gif = $("<img>").addClass("gif").attr("src", "/" + match[1] + ".gif");
    $(".gif-container").prepend($gif);
  }

  if (navigator.userAgent.match(/Chrome/)) {
    $(document.body).prepend("<p style='position: absolute; top: 5px; left: 25px; font-size: 10px; color: #999'>If you have problems loading this GIF, try any other browser. Chrome has an <a style='color:#aaa' href='http://code.google.com/p/chromium/issues/detail?id=147223'>unresolved bug with animated GIFs</a>.</p>")

  }

});
