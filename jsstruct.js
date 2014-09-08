/*
  author kyle graehl

  credit - based on https://github.com/tjfontaine/node-struct
*/
(function() {
    self.jsstruct = {}

    var entries = {
        x: {},
        c: {
            size: 1,
            string: true,
        },
        b: {
            size: 1,
            native: 'Int8',
            endian: false,
        },
        B: {
            size: 1,
            native: 'Uint8',
            endian: false,
        },
        '?': {
            size: 1,
            native: 'Uint8',
            endian: false,
        },
        h: {
            size: 2,
            native: 'Int16',
        },
        H: {
            size: 2,
            native: 'Uint16',
        },
        i: {
            size: 4,
            native: 'Int32',
        },
        I: {
            size: 4,
            native: 'Uint32',
        },
        l: {
            size: 4,
            native: 'Int32',
        },
        L: {
            size: 4,
            native: 'Uint32',
        },
        /* TODO XXX FIXME
           q: {
           size: 8,
           native: 'Int32',
           },
           Q: {
           size: 8,
           native: 'UInt32',
           },
        */
        f: {
            size: 4,
            native: 'Float32',
        },
        d: {
            size: 8,
            native: 'Float64',
        },
        s: {
            size: 1,
            string: true,
        },
    };

    var ENDIAN = {
        '@': false,
        '=': false,
        '<': 'LE',
        '>': 'BE',
        '!': 'BE',
    };

    var format_method = function(entry, prefix, endian) {
        var meth = prefix + entry.native;
        if (entry.endian !== false) {
            if (endian !== undefined && endian !== false) {
                meth += endian;
            } else {
                meth += 'LE';
            }
        }
        return meth;
    };

    var fmt_to_list = function(fmt, prefix) {
        var elm = fmt.split('');
        elm.reverse();

        var c = elm.pop();
        var endian = ENDIAN[c];

        if (endian !== undefined) {
            c = elm.pop();
        }

        var count = '';
        var result = [];

        while(c) {
            if (isFinite(c)) {
                count += c;
                c = elm.pop();
                continue;
            } else {
                if (entries[c]) {
                    var size = parseInt(count, 10);
                    count = '';

                    if (isNaN(size)) {
                        size = 1;
                    }

                    var entry = entries[c];

                    result.push({
                        meth: format_method(entry, prefix, endian),
                        endian: endian,
                        size: size,
                        entry: entry,
                    });

                    c = elm.pop();
                } else {
                    throw new Error("Not a valid format character: " + c);
                }
            }
        }

        return result;
    };

    var unpack = function(fmt, input, encoding, pos) {
        var calls, result = [];

        if (! input instanceof ArrayBuffer) {
            throw new Error("Input not a buffer object");
        }

        if (!encoding) {
            encoding = 'ascii';
        }

        calls = fmt_to_list(fmt, 'get');

        if (pos === undefined) {
            pos = 0;
        }

        calls.forEach(function(c) {
            var i;
            if (c.entry.string) {
                result.push(input.toString(encoding, pos, c.size));
                pos += c.size;
            } else {

                // parse out the LE/BE suffix and use it
                var useLE = false
                if (c.meth[c.meth.length - 2] + c.meth[c.meth.length - 1] == 'LE') {
                    c.meth = c.meth.slice(0,c.meth.length-2)
                    useLE = true
                } else if (c.meth[c.meth.length - 2] + c.meth[c.meth.length - 1] == 'BE') {
                    c.meth = c.meth.slice(0,c.meth.length-2)
                    useLE = false
                }

                var view = new DataView(input)

                for (i = 0; i < c.size; i++) {
                    if (pos + c.entry.size <= input.byteLength) {
                        result.push(view[c.meth](pos, useLE));
                    } else {
                        console.warn('outside dataview bounds...', pos,'/',input.byteLength, c)
                    }
                    pos += c.entry.size;
                }
            }
        });

        return result;
    };
    jsstruct.unpack = unpack;

    var calc_size = function(calls) {
        var size = 0;
        calls.forEach(function(c) {
            size += c.size * c.entry.size;
        });
        return size;
    };

    var calcsize = function(fmt) {
        var calls = fmt_to_list(fmt, '');
        return calc_size(calls);
    };
    jsstruct.calcsize = calcsize;

    var pack = function(fmt, buff, buf_pos) {
        var calls = fmt_to_list(fmt, 'set');
        var size = calc_size(calls);
        var result, values, position;

        if (buff instanceof Buffer) {
            if (size + buf_pos > buff.length) {
                throw new Error("Buffer not large enough for packing");
            }
            result = buff;
            position = buf_pos;
            values = Array.prototype.slice.call(arguments, 3);
        } else {
            result = new Buffer(size);
            position = 0;
            values = Array.prototype.slice.call(arguments, 1);
        }

        var expected = 0;
        calls.forEach(function(c) {
            expected += c.size;
        });

        if (expected !== values.length) {
            throw new Error("Argument mismatch, Expected: " + expected + " Received: " + values.length);
        }

        var pos = 0;
        var arg_pos = 0;
        var i;

        for (i=0; i<calls.length; i++) {
            var call = calls[i];
            var arg  = values[arg_pos];
            if (call.entry.string) {
                result.write(arg, pos + position, arg.length);
                arg_pos += 1;
                pos += call.size * call.entry.size;
            } else {
                var j;
                for (j=0; j<call.size; j++) {
                    Buffer.prototype[call.meth].call(result, arg, pos + position);
                    pos += call.entry.size;
                    arg_pos += 1;
                }
            }
        }

        return result;
    };

    jsstruct.pack = pack;

})()