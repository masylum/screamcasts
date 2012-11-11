$(function () {

  // Load GIF from the path

  // Paths like /v/7h9zKE
  var match = location.pathname.match(/\/v\/([a-z0-9]+)/i);

  if (match[1]) {
    var $gif = $("<img>").addClass("gif").attr("src", "/" + match[1] + ".gif");
    $(".gif-container").prepend($gif);
  }

});
