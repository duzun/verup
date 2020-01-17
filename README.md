# verup [![npm version](https://badge.fury.io/js/verup.svg)](https://badge.fury.io/js/verup)

**v1.7.1**

Increment and update version in all project files.

## Install

```sh
npm i --save-dev verup
```

For convenience, install it globally too:

```sh
npm i -g verup
```

Actually, it is not required to install `verup` if you have npm@5.2.0 and up.

Just run `npx verup` after you've added `extra.verup` field to `package.json` file.

Here is an example of what `package.json` might contain:

```js
...
"scripts": {
  "verup": "verup",
  "build": "verup -- 1 && build.sh",
  "version": "verup 0" // this one gets called on `npm version <newver>` to patch other project files
},
"extra": {
  "verup": {
    "files": [...],
    "regs":[...]
  }
}
...
```

## CLI

Now you can run:

```sh
npx verup 1       # to increment revision by 1 or
npx verup -2      # to decrement revision by 2 or
npx verup "1.0"   # to increment minor version by 1 or
npx verup "1.0.0" # to increment major version by 1
```

Or using `npm` in your project's root, when you have `scripts.verup` in `package.json`
(see example above):

```sh
npm run verup -- 2    # to increment revision by 2 or
npm run verup -- -1   # to decrement revision by 1 or
npm run verup -- -1.0 # to decrement minor version by 1
npm version [<newver> | major | minor | patch | ...] --no-git-tag-version
```

When `verup` is installed globally, you could run it in the project folder like this:

```sh
verup 1
verup 1.0
verup -1.0
```

If you have subprojects, and want to avoid confusion as of
which project to patch, use `-n <projectName>` option:

```sh
./node_modules/my-subproject/node_modules/verup -n 'main-project' -b 1.0
```

This will look for `package.json` with `name == 'main-project'` in all parent folders,
until it finds the right level, and patch the files at that level.


## In package.json

The minimum setup for your project is to add the list of file names that contain
version string to `package.json` at `extra.verup.files`.
Here is a sample:

```js
...
"extra": {
  "verup": {
    "files": [
      "manifest.json",
      "index.js",
      "README.MD" ...
    ]
  }
}
...
```

If the file is a `.json`, version is expected to be at key `version`.
Otherwise version string is searched line by line using a list of regular expressions.
By default it would look for expressions like:

- `var version = 'x.x.x'`
- `$version = 'x.x.x'`
- `version := 'x.x.x'`
- `@version x.x.x`
- `const VERSION = 'x.x.x'`
- `* vX.X.X`

You can define you own list of regular expressions in `package.json` at `extra.verup.regs`:

```js
...
"extra": {
  "verup": {
    "regs": [
      "((?:\\$|(?:\\s*\\*?\\s*@)|(?:^\\s*(?:var|,)?\\s+))ver(?:sion)?[\\s\\:='\"]+)([0-9]+(?:\\.[0-9]+){2,2})",
      "^(\\s*\\$(?:_)?version[\\s='\"]+)([0-9]+(?:\\.[0-9]+){2,2})",
      "^(\\s?\\*.*v)([0-9]+(?:\\.[0-9]+){2,2})"
    ]
  }
}
...
```


### Related

Consider reading [semver](https://semver.org/).
