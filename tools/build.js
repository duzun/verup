#!/usr/bin/env node
/**
 *   Compile JS files using Closure-Compiler service
 */
var http        = require('http');
var fs          = require('fs');
var path        = require('path');
var querystring = require('querystring');

var hashes = ['verup'];

var dir = path.join(__dirname, '..');
var dist = path.join(dir, 'dist');
var packo = require(path.join(dir, 'package.json'));
var version = packo.version;

if ( !fs.existsSync(dist) ) {
    fs.mkdir(dist)
}

hashes.forEach(function (name) {
    var filename = path.join(dir, name + '.js');
    fs.createReadStream(filename).pipe(fs.createWriteStream(path.join(dist, name + '.' + version + '.js')));
    compileFile(filename, function (err, data) {
        if (err) {
            return console.error(err);
        }
        if ( data ) {
            var filename = path.join(dist, name + '.' + version + '.min.js');
            fs.writeFile(filename, "#!/usr/bin/env node\n" + data.trim(), function (err) {
                if (err) throw err;
                console.log("\x1b[32m%s\x1b[0m", filename);
            })
        }
    });
});

// Helpers
function compileFile(filename, cb) {
    fs.readFile(
      filename
      , { encoding: 'utf-8' }
      , function (err, data) { err ? cb(err) : compile(data, cb) }
    );
}

function compile(script, cb) {
    var options = {
        output_info: 'compiled_code'
      , output_format: 'text'
      , compilation_level: 'SIMPLE_OPTIMIZATIONS'
      , warning_level: 'QUIET'
      , js_code: script
    };

    var data = querystring.stringify(options);

    var req = http.request({
      hostname: 'closure-compiler.appspot.com'
      , port: 80
      , path: '/compile'
      , method: 'POST'
      , headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data)
      }
    }, function(res) {
      // console.log('STATUS: ' + res.statusCode);
      var body = [];
      res.setEncoding('utf8');
      res.on('data', function (chunk) { body.push(chunk) });
      res.on('end', function () { cb(null, body = body.join(''), res) });
    });

    req.on('error', cb);

    req.write(data);
    req.end();
}

