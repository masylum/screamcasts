
$.fn.addVignette = function () {
  return this.each(function () {
    var $obj = jQuery(this), canvas = this;

    if (!$obj.is('canvas')) { return; }

    var ctx = this.getContext('2d');

    options = { vignette: { black: 0.6, white: 0.1 } };
    var gradient;
    var outerRadius = Math.sqrt( Math.pow(canvas.width/2, 2) + Math.pow(canvas.height/2, 2) );
    ctx.globalCompositeOperation = 'source-over';
    gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, outerRadius);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.65, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,' + options.vignette.black + ')');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'lighter';
    gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, outerRadius);
    gradient.addColorStop(0, 'rgba(255,255,255,' + options.vignette.white + ')');
    gradient.addColorStop(0.65, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });
};
