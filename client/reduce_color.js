/**
 * Take an array of pixels and return an approximation of it
 * with 256 colors, returning a palette and the mapped pixels
 */
function reduceTo256Colors(pixels, width, height) {
  // Generate RGB pixels, skipping the alpha channel
  var rgbPixels = []
    , i
    , cmap, new_pixels, mapped_pixels, palette;

  // Prepare an array with rgb pixels
  for (i = 0; i < pixels.length / 4; i++) {
    rgbPixels.push([pixels[i*4], pixels[i*4+1], pixels[i*4+2]]);
  }

  // Quantize: generate a 256 palette + color map approximation of rgbPixels
  cmap = MMCQ.quantize(rgbPixels, 16);
  new_pixels = rgbPixels.map(function (p) { 
    return cmap.map(p); 
  });

  palette = cmap.palette();
  var mapped_pixels = _(new_pixels).map(function (p) {
    return palette.indexOf(p);
  });

  return { palette: palette
         , new_pixels: new_pixels
         , mapped_pixels: mapped_pixels
         , width: width
         , height: height };
}

/**
 * Draw a canvas from reduced data (palette + mapped pixels)
 */
function drawCanvasFromReducedImageData(data) {
  // draw new pixels
  var canvas = document.getElementById('reduced_image')
  var ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  canvas.width = data.width;
  canvas.height = data.height;
  function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
  }
  var imageData = ctx.createImageData(data.width, data.height);

  for (y = 0; y < data.height; y++) {
    inpos = y * data.width * 4; // 4 for 4 ints per pixel

    for (x = 0; x < data.width; x++) {
      inpos = y * data.width + x;
      p = data.palette[data.mapped_pixels[inpos]];
      setPixel(imageData, x, y, p[0], p[1], p[2], 255);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

