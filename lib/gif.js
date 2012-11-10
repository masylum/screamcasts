(function () {
  var global = this
    , Gif = {header: ['47', '49', '46', '38', '39', '61'], trailer: ['3b']};

  function bin2Hex(n) {
    return parseInt(n, 2).toString(16);
  }

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

  Gif.lwz = function lwz(index_stream, min_code_size) {
    var clear_code = Math.pow(2,  min_code_size)

      , eoi_code = clear_code + 1
      , top_code = clear_code + 2
      , code_size = min_code_size + 1

      , index_buffer = []
      , code_table = {}
      , output = [""];

    code_table = _.object(_.range(eoi_code + 1), _.range(eoi_code + 1));

    function toHex(bin) {
      return pad(bin2Hex(bin), 2);
    }

    function push(value) {
      var i_code = pad(Number(value).toString(2), code_size)
        , last = output.length - 1
        , offset = output[last].length + code_size - 8;

      // pack
      if (offset === 0) {
        output[last] = toHex(i_code + output[last]);
        output.push("");
      // split le byte!
      } else if (offset > 0) {
        output[last] = toHex(i_code.substr(offset, i_code.length) + output[last]);
        output.push(i_code.substr(0, offset));
      // append
      } else {
        output[last] = i_code + output[last];
      }
    }

    function findCode(bf) {
      return code_table[bf.join(',')];
    }

    push(String(clear_code));
    index_buffer.push(_.first(index_stream));

    _.each(_.tail(index_stream), function (k, i) {
      var index_plus_k = index_buffer.concat([k]).join(',')
        , new_code
        , c = code_table[index_plus_k];

      // TODO: handle code_size 12?
      // TODO: handle #4?
      if (c) {
        index_buffer.push(k);
      } else {
        code_table[index_plus_k] = top_code;
        new_code = findCode(index_buffer);
        push(new_code);

        if (top_code === Math.pow(2, code_size)) {
          code_size++;
        }

        top_code++;

        index_buffer = [k];
      }

    });

    push(findCode(index_buffer));
    push(String(eoi_code));
    output[output.length - 1] = toHex(pad(_.last(output), 8));
    output.push("00");

    return output;
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
