/*globals reduceColors, drawCanvasFromReducedImageData, HexBinConverter, Gif*/
$(function () {

  // Add a video element we'll use to stream data
  $('body').append('<video id="live_video" autoplay>');
  $('video').hide();

  var video = document.getElementById("live_video")
    , video_stream
    , canvas = document.getElementById('tutorial')
    , window_id
    , ctx
    , size = 100
    , colors = 16;

  if (canvas.getContext) {
    document.getElementById('tutorial').width = size;
    document.getElementById('tutorial').height = size;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
  }

  function randomId(length) {
    var result = ''
      , i
      , chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (i = length; i > 0; --i) {
      result += chars[Math.round(Math.random() * (chars.length - 1))];
    }

    return result;
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

      // 0-1 ms
      ctx.drawImage(video, 80, 0, 480, 480, 0, 0, canvas.width, canvas.height);
      pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      // 30-40 ms
      reduced = reduceColors(pixels, canvas.width, canvas.height, colors);

      // 0-1 ms
      drawCanvasFromReducedImageData(reduced);
      color_table = Gif.mapColorTable(reduced.palette, colors);

      // 15 ms
      data = Gif.addImage(reduced.mapped_pixels, color_table, [size, size], colors);
      data = data.join('');

      $.post('/capture?window_id=' + window_id, {data: HexBinConverter.hexToBase64(data)});

      // 1 ms
      if (this.started || (pixels[0] !== 0 && pixels[1] !== 0 && pixels[2] !== 0)) {
        this.started = true; // prevent effects before video started
        $(canvas).addVignette();
      }
    }
  }

  if (navigator.webkitGetUserMedia) {
    navigator.webkitGetUserMedia({video: true, audio: true},
      function success(stream) {
        video.src = window.webkitURL.createObjectURL(stream);
        video_stream = stream;
        window_id = randomId(32);
        $('#window_url').html(document.location.host + '/window/' + window_id + '.gif');
        setInterval(sendFrame, 50);
      },
      function (e) {
        error("Couldn't get access to your webcam. Please grant permission.");
      }
    );
  } else {
    error("This demo is bleeding edge, so your browser isn't supported. Please use the newest Chrome.");
  }

});
