/*globals reduceColors, drawCanvasFromReducedImageData, HexBinConverter, Gif*/
$(function () {

  // Add a video element we'll use to stream data
  $('body').append('<video id="live_video" autoplay>');
  $('video').hide();

  var video = document.getElementById("live_video")
    , video_stream
    , canvas = document.getElementById('tutorial')
    , ctx
    , size = 100
    , colors = 16;

  if (canvas.getContext) {
    document.getElementById('tutorial').width = size;
    document.getElementById('tutorial').height = size;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
  }

  function error(msg) {
    console.log("Error: " + msg);
  }

  function sendFrame() {
    if (video_stream) {
      var canvas = document.querySelector('#tutorial')
        , ctx = canvas.getContext('2d')
        , data
        , pixels, color_table, reduced;

      ctx.drawImage(video, 80, 0, 480, 480, 0, 0, canvas.width, canvas.height);

      pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      reduced = reduceColors(pixels, canvas.width, canvas.height, colors);
      drawCanvasFromReducedImageData(reduced);

      color_table = Gif.mapColorTable(reduced.palette, colors);
      data = Gif.addImage(reduced.mapped_pixels, color_table, [size, size], colors);
      data = data.join('');
      $.post('/capture', {data: HexBinConverter.hexToBase64(data)});
    }
  }

  if (navigator.webkitGetUserMedia) {
    navigator.webkitGetUserMedia({video: true, audio: true},
      function success(stream) {
        video.src = window.webkitURL.createObjectURL(stream);
        video_stream = stream;
        setInterval(sendFrame, 1000);
      },
      function (e) {
        error("Couldn't get access to your webcam. Please grant permission. Please make sure you are not running this from your file system.");
      }
    );
  } else {
    error("This demo is bleeding edge, so your browser isn't supported. Please use the newest Chrome.");
  }

});
