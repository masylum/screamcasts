$(function () {

  // Add a video element we'll use to stream data
  $('body').append('<video id="live_video" autoplay>');
  $('video').hide();

  var video = document.getElementById("live_video")
    , video_stream;

  if (navigator.webkitGetUserMedia) {
    navigator.webkitGetUserMedia({ video: true, audio: true },
      function success(stream) {
        video.src = window.webkitURL.createObjectURL(stream);
        video_stream = stream;
        setInterval(sendFrame, 100);
      },
      function error(e) {
        error("Couldn't get access to your webcam. Please grant permission.");
      }
    );
  } else {
    error("This demo is bleeding edge, so your browser isn't supported. Please use the newest Chrome.");
  }

  function sendFrame() {
    if (video_stream) {
      var canvas = document.querySelector('#tutorial');
      var ctx = canvas.getContext('2d');
      ctx.drawImage(video,
          80, 0, 480, 480,
          0, 0, canvas.width, canvas.height);

      var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      reduced = reduceTo256Colors(pixels, canvas.width, canvas.height);
      drawCanvasFromReducedImageData(reduced);
    }
  }

});
