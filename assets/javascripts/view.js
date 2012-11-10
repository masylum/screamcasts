$(function (){

  var $body = $('body'),
      $b1 = $('<div class="bar"></div>').appendTo($body),
      $b2 = $b1.clone().appendTo($body),
      $container = $('.center-container'),
      $gif = $('.gif'),
      t = 1;


  function moveBg (){
    t++;
    var h = $body.height(),
        r1 = Math.random(),
        r2 = Math.random();

    $body.css({
      backgroundPosition: ~~ (r1*100)/t + 'px ' + ~~ (r2*100)/t + 'px'
    });

    $b1.css({ top: ~~(r1*1000)/t + '%'});
    $b2.css({ top: ~~(r2*1000)/t + '%'});
    if (t < 30) setTimeout(moveBg, 100);
  }

  function onResize () {
    var h = $body.height(),
        w = $body.width(),
        min = Math.min(h,w);

    $container.css({
      width: min - 50 + 'px',
      height: min + 'px'
    });
  }

  $(window).on('resize', onResize);
  onResize();
  moveBg();
});