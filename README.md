# gulp-js-parent

Useful when working on a larger project: JavaScript can be (re-)built incrementally on a per-need basis.



## Install

```bash
# Using npm
npm install @nashiko/gulp-js-parent --save

# Using yarn
yarn add @nashiko/gulp-js-parent
```



## Usage

You can use `gulp-js-parent` with `gulp-cached` to only process the files that have changed but also recompile files that import the one that changed.

```js
'use strict';
var gulp = require('gulp');
var jsParent = require('@nashiko/gulp-js-parent');
var cached = require('gulp-cached');
var gulpif = require('gulp-if');
var filter = require('gulp-filter');

gulp.task('js', function() {
  return gulp.src('src/js/**/*.js')

    //filter out unchanged js files, only works when watching
    .pipe(gulpif(global.isWatching, cached('js')))

    //find files that depend on the files that have changed
    .pipe(jsParent({dir: 'src/js/'}))

    //filter out internal imports (folders and files starting with "_" )
    .pipe(filter(function (file) {
      return !/\/_/.test(file.path) || !/^_/.test(file.relative);
    }))
    
    //...
});
gulp.task('setWatch', function() {
    global.isWatching = true;
});
gulp.task('watch', ['setWatch', 'js'], function() {
    //your watch functions...
});
```


## Contributing :tada:
```bash
# Install dependencies
yarn

# Run tests
yarn test
```



## License

MIT
