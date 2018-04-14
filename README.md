# verup
Increment and update version in all project files.

**v1.6.0**

## Usage

Install with

```sh
npm i verup --save-dev
```

or place `verup.js` file somewhere in your projects' folder
and add `.verup` field to `package.json` file.

For convenience, install it globally too:

```sh
npm -g i verup
```

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
    "files": [
      "manifest.json",
      "index.js",
      "README.MD" ...
    ]
  }
}
...
```

Now you can run:

```sh
npm run verup 1       # to increment revision by 1 or
npm run verup "1.0"   # to increment minor version by 1 or
npm run verup "1.0.0" # to increment major version by 1
```

Or using `npm` in your project's root:

```sh
npm run verup -- 2    # to increment revision by 2 or
npm run verup -- -1   # to decrement revision by 1 or
npm run verup -- -1.0 # to decrement minor version by 1
npm version [<newver> | major | minor | patch | ...] --no-git-tag-version
```
