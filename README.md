# verup
Increment and update version in all project files

## Ussage

Place `verup.js` file somewhere in your projects' folder and add `verup` field to `package.json` file.

Here is an example of what `package.json` might contain:
```js
...
"verup": {
  "files": [
    "manifest.json",
    "index.js",
    "README.MD" ...
  ]
}
"scripts": {
  "verup": "node ./path/to/verup.js",
  "build": "node ./path/to/verup.js -- 1 && build.sh"
}
...
```

Now you can run 

`node verup.js 1` to increment revision by 1 or

`node verup.js "1.0"` to increment minor version by 1 or 

`node verup.js "1.0.0"` to increment major version by 1.
