#!/usr/bin/env node
(function() {
  var path = require("path");
  var fs = require("fs");
  var requireJSON = require;
  try {
    requireJSON = require("require-json5");
  } catch (err) {
  }
  var ver_reg = [/^((?:\$|(?:\s*\**\s*@)|(?:\s*(?:var|,)?\s+))version[\s:='"]+)([0-9]+(?:\.[0-9]+){2,2})/i, /^(\s*(?:export\s+)?(?:const|var|let)\s+VERSION[\s='"]+)([0-9]+(?:\.[0-9]+){2,2})/i, /^(\s?\*.*v)([0-9]+(?:\.[0-9]+){2,2})/];
  var json_ver_reg = /^(\s*['"]version['"]\s*:\s*['"])([0-9]+(?:\.[0-9]+){2,2})/i;
  var bump = "1";
  var name = "";
  var _a = "b";
  process.argv.forEach(function(v, i) {
    if (i < 2) {
      return;
    }
    if (v.slice(0, 1) == "-" && isNaN(parseFloat(v))) {
      _a = v.slice(1);
    } else {
      switch(_a) {
        case "b":
          {
            bump = v;
          }
          break;
        case "n":
          {
            name = v;
          }
          break;
      }
      _a = "b";
    }
  });
  var packFile = findPackage(process.cwd(), name) || findPackage(__dirname, name);
  if (!packFile) {
    process_throw("package.json file not found", 1);
  }
  var _root = path.dirname(packFile);
  var packo = requireJSON(packFile);
  if (!packo) {
    process_throw("Can't read package.json file", 2);
  }
  var _verup = packo.extra && packo.extra.verup || packo.verup;
  if (!_verup) {
    process_throw("package.json doesn't have a `verup` property defined", 3);
  }
  var files = _verup.files;
  if (_verup.regs) {
    ver_reg = _verup.regs.map(function(r) {
      return new RegExp(r, "i");
    });
  }
  var over = packo.version;
  if (over) {
    bump = bump.split(".").reverse();
    var nver = over.split(".").reverse();
    var b, l;
    while (bump.length && !(b = parseInt(bump.pop()))) {
    }
    l = bump.length;
    nver[l] = +nver[l] + b;
    bump.forEach(function(v, i) {
      nver[i] = v;
    });
    nver = nver.reverse().join(".");
    packo.version = nver;
    console.log("Bumping version: " + over + " -> " + nver);
    var buf = JSON.stringify(packo, null, 2);
    if (buf && over != nver) {
      buf += "\n";
      fs.writeFileSync(packFile, buf);
    }
    var ver_reg_rep = function($0, $1) {
      return $1 + nver;
    };
    files.forEach(function(f) {
      var fn = path.join(_root, f);
      var cnt = fs.readFileSync(fn, "utf8");
      var ext = path.extname(f);
      var buf;
      switch(ext) {
        case ".json":
          {
            try {
              var packo$0 = JSON.parse(cnt);
              packo$0.version = nver;
              buf = JSON.stringify(packo$0, null, 2);
              if (buf) {
                buf += "\n";
              }
            } catch (err$1) {
              buf = cnt.split("\n").map(function(l) {
                return json_ver_reg.test(l) ? l.replace(json_ver_reg, ver_reg_rep) : l;
              }).join("\n");
            }
          }
          break;
        default:
          {
            buf = cnt.split("\n").map(function(l) {
              for (var i = ver_reg.length; i--;) {
                if (ver_reg[i].test(l)) {
                  return l.replace(ver_reg[i], ver_reg_rep);
                }
              }
              return l;
            }).join("\n");
          }
      }
      if (buf && buf != cnt) {
        console.log("\t" + fn.replace(_root, "").replace(/^[\\/]+/, ""));
        fs.writeFileSync(fn, buf);
      }
    });
  }
  function process_throw(msg, code) {
    process.stderr.write(msg + "\n");
    process.exit(code);
  }
  function findPackage(dir, packageName) {
    var d = dir || ".";
    do {
      var f = path.join(d, "package.json");
      if (fs.existsSync(f)) {
        if (!path.isAbsolute(f)) {
          f = fs.realpathSync(f);
        }
        var p = requireJSON(f);
        if (packageName) {
          if (p) {
            if (p.name == packageName) {
              return f;
            }
          }
        } else {
          if (p) {
            if ((p.extra && p.extra.verup || p.verup) && p.name != "verup") {
              return f;
            }
          }
        }
      }
      dir = d;
      d = path.join(d, "..");
    } while (d != dir && dir.slice(0, 2) != "..");
    return false;
  }
})();

