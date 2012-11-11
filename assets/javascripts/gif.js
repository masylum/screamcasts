(function () {
  var global = this
    , Gif = {header: ['47', '49', '46', '38', '39', '61'], trailer: ['3B']};

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
    output.push(bin2Hex('0' + table_size + '0000')); // TODO: unhardcode
    output = output.concat(['00', '00']);

    return output;
  }

  /**
   * Encodes each frame
   */
  Gif.addImage = function (index_stream, color_table, sizes, colors) {
    var output = []
      , min_code_size = tableSize(colors)
      , table_size = min_code_size - 1
      , lwz_result = Gif.lwz(index_stream, min_code_size);

    output = output.concat(['21', 'f9', '04']);
    output.push(pad(bin2Hex('00000100'), 2)); // TODO: unhardcode
    // TODO: unhardcode
    // 100ms delay between frames to fix Chrome shite
    // we are sending a frame each 200ms
    output = output.concat(['64', '00', '00', '00']);

    output = output.concat(['2c', '00', '00', '00', '00']); // TODO: unhardcode
    output = output.concat(mapSizes(sizes));
    output.push(bin2Hex('10000' + pad(table_size.toString(2), 3))); // TODO: unhardcode
    output = output.concat(color_table);
    output.push(pad(min_code_size.toString(16), 2));
    output = output.concat(lwz_result);

    return output;
  };

  /**
   * Initializes headers for the GIF
   */
  Gif.encode = function (width, height, colors) {
    var output = Gif.header;
    output = output.concat(logicalScreenDescriptor([width, height], colors));
    return output;
  };

  Gif.lwz = function lwz(index_stream, min_code_size) {
    var clear_code = Math.pow(2,  min_code_size)

      , eoi_code = clear_code + 1
      , top_code = clear_code + 2
      , code_size = min_code_size + 1

      , index_buffer = []
      , code_table = {}
      , sub_block = [""]
      , num_bytes = 0
      , output = [];

    code_table = _.object(_.range(eoi_code + 1), _.range(eoi_code + 1));

    function toHex(bin) {
      return pad(bin2Hex(bin), 2);
    }

    function push(value) {
      var i_code = pad(Number(value).toString(2), code_size).split('')
        , bit
        , last = sub_block.length - 1;

      while (i_code.length) {
        bit = i_code.pop();
        sub_block[last] = bit + sub_block[last];

        if (sub_block[last].length === 8) {
          sub_block[last] = toHex(sub_block[last]);
          num_bytes++;

          if (num_bytes === 255) {
            output.push('FF');
            output = output.concat(sub_block.slice(0, 255));
            num_bytes = 0;
            sub_block = [""];
            last = 0;
          } else {
            sub_block.push("");
            last++;
          }
        }
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

    // fill the rest with zeroes
    sub_block[sub_block.length - 1] = toHex(pad(_.last(sub_block), 8));

    output.push(pad(sub_block.length.toString(16), 2));
    output = output.concat(sub_block);

    output.push("00");

    return output;
  };

  Gif.mapColorTable = function (color_table, colors) {
    color_table = _.compose(_.flatten, _.map)(color_table, function (colors) {
      return _.map(colors, function (color) {
        return pad(Number(color).toString(16), 2);
      });
    });

    // fill the rest of the table
    while (color_table.length / 3 < colors) {
      color_table = color_table.concat(['ff', 'ff', 'ff']);
    }

    return color_table;
  };

  global.Gif = Gif;
}());
