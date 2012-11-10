(function () {
  var global = this
    , Gif = {header: ['47', '49', '46', '38', '39', '61'], trailer: ['3b']};

  function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
      str = '0' + str;
    }
    return str;
  }

  function mapSizes(sizes) {
    return _.compose(_.flatten, _.map)(sizes, function (size) {
      return pad(size.toString(16), 4).match(/.{1,2}/g).reverse();
    });
  }

  function tableSize(colors) {
    return Math.log(colors) / Math.log(2);
  }

  function logicalScreenDescriptor(sizes, colors) {
    var output = []
      , table_size = pad((tableSize(colors) - 1).toString(2), 3);

    output = output.concat(mapSizes(sizes));
    output.push(parseInt('0' + table_size + '0' + table_size, 2).toString(16)); // TODO: unhardcode
    output = output.concat(['00', '00']);

    return output;
  }

  Gif.addImage = function () {
  };

  Gif.encode = function () {
  };

  Gif.lwz = function lwz() {
  };

  Gif.analizeImage = function analizeImage(pixels, width, height) {
    var index_stream = []
      , color_table = []
      , y = 0
      , x, rgb, inpos;

    // HACK FOR DA EXAMPLE
    color_table.push('255,255,255');
    color_table.push('255,0,0');
    color_table.push('0,0,255');
    color_table.push('0,0,0');

    for (; y < height; y++) {
      inpos = y * width * 4; // 4 for 4 ints per pixel
      x = 0;

      for (; x < width; x++) {
        rgb = [pixels[inpos++], pixels[inpos++], pixels[inpos++]].join(',');
        inpos++; // alpha

        if (!_.include(color_table, rgb)) {
          index_stream.push(color_table.length);
          color_table.push(rgb);
        } else {
          index_stream.push(_.indexOf(color_table, rgb));
        }
      }
    }

    return {
      index_stream: index_stream
    , color_table: color_table
    };
  };

  // exports
  global.Gif = Gif;
}());
