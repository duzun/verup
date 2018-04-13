#!/usr/bin/env node
/**
 * Increment and update version in all project files.
 *
 * Usage:
 *
 *  Increment revision by 1:
 *      node verup.js 1
 *
 *  Increment minor version by 1:
 *      node verup.js 1.0
 *
 *  Increment major version by 1:
 *      node verup.js 1.0.0
 *
 *
 * @author Dumitru Uzun (DUzun.Me)
 * @version 1.5.0
 */

(() => {

const path = require('path');
const fs   = require('fs');

let ver_reg = [
    // var version = 'x.x.x'; $version = 'x.x.x'; version := 'x.x.x'; @version x.x.x;
    /^((?:\$|(?:\s*\**\s*@)|(?:\s*(?:var|,)?\s+))version[\s\:='"]+)([0-9]+(?:\.[0-9]+){2,2})/i
    // const VERSION = 'x.x.x';
  , /^(\s*const\s+VERSION[\s='"]+)([0-9]+(?:\.[0-9]+){2,2})/i
    // * vX.X.X
  , /^(\s?\*.*v)([0-9]+(?:\.[0-9]+){2,2})/
];

const json_ver_reg = /^(\s*['"]version['"]\s*\:\s*['"])([0-9]+(?:\.[0-9]+){2,2})/i;

/// bump should be 1 for revision, 1.0 for minor and 1.0.0 for major version
let bump = '1'; // bump by

/// Project name to bump (search it's package.json folder)
let name = '';

let _a = 'b';
process.argv.forEach((v, i) => {
    if ( i < 2 ) return;
    if ( v.slice(0,1) == '-' && isNaN(parseFloat(v)) ) {
        _a = v.slice(1);
    }
    else {
        switch(_a) {
            case 'b': {
                bump = v;
            } break;
            case 'n': {
                name = v;
            } break;
        }
        _a = 'b';
    }
});

const packFile = findPackage(__dirname, name);

if ( !packFile ) {
    process_throw('package.json file not found', 1);
}

const _root = path.dirname(packFile);
const packo = require(packFile);

if ( !packo ) {
    process_throw(`Can't read package.json file`, 2);
}

const _verup = packo.extra && packo.extra.verup || packo.verup;

if ( !_verup ) {
    process_throw('package.json doesn\'t have a `verup` property defined', 3);
}

const files = _verup.files;

if ( _verup.regs ) {
    ver_reg = _verup.regs.map((r) => new RegExp(r, 'i'));
}

const over = packo.version;
if ( over ) {
    bump = bump.split('.').reverse();

    let nver = over.split('.').reverse();
    var b, l;
    while(bump.length && !(b = parseInt(bump.pop())));
    l = bump.length;

    // console.log({b:b,nver:nver,over:over,l:l,bump:bump})
    nver[l] = +nver[l] + b;
    bump.forEach((v,i) => { nver[i] = v; });

    nver = nver.reverse().join('.');
    packo.version = nver;

    console.log('Bumping version: ' + over + ' -> ' + nver);

    let buf = JSON.stringify(packo, null, 2);

    if ( buf && over != nver ) {
        buf += "\n";
        fs.writeFileSync(packFile, buf);
    }

    const ver_reg_rep = ($0, $1) => $1 + nver;

    files.forEach((f) => {
        const fn = path.join(_root, f);
        const cnt = fs.readFileSync(fn, 'utf8');
        const ext = path.extname(f);
        var buf;

        switch(ext) {
            case '.json': {
                try {
                    const packo = JSON.parse(cnt);
                    packo.version = nver;
                    buf = JSON.stringify(packo, null, 2);
                    if ( buf ) {
                        buf += "\n";
                    }
                }
                catch(err) {
                    buf = cnt
                        .split('\n')
                        .map((l) => json_ver_reg.test(l)
                            ? l.replace(json_ver_reg, ver_reg_rep)
                            : l
                        )
                        .join("\n")
                    ;
                }
            } break;

            default: {
                buf = cnt
                    .split('\n')
                    .map((l) => {
                        for(let i=ver_reg.length; i--;) {
                            if ( ver_reg[i].test(l) ) {
                                return l.replace(ver_reg[i], ver_reg_rep);
                            }
                        }
                        return l;
                    })
                    .join("\n")
                ;
            }
        }
        if ( buf && buf != cnt ) {
            console.log("\t" + fn.replace(_root, '').replace(/^[\\/]+/, ''));
            fs.writeFileSync(fn, buf);
        }
    });

}

function process_throw(msg, code) {
    process.stderr.write(`${msg}\n`);
    process.exit(code);
}

/// Find package.json file in closest folder from `dir` and up.
function findPackage(dir, packageName) {
    let d = dir || '.';
    do {
        let f = path.join(d, 'package.json');
        if ( fs.existsSync(f) ) {

            const p = require(f);
            // Look for a specific project name
            if ( packageName ) {
                if ( p ) {
                    if ( p.name == packageName ) {
                        return f;
                    }
                }
            }
            // Look for any project except this one (verup)
            else {
                if ( !p || p.name != 'verup' ) {
                    return f;
                }
            }
        }
        dir = d;
        d = path.join(d, '..');
    } while (d != dir && dir.slice(0,2) != '..');
    return false;
}

})();
