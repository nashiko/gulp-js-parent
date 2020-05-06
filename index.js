'use strict';

var es = require('event-stream');
var _ = require('lodash');
var fs = require('fs');
var gutil = require('gulp-util');
var sassGraph = require('sass-graph');
var PLUGIN_NAME = 'gulp-sass-inheritance';
var pathRequire = require('path');

var stream;

function gulpSassInheritance(options) {
  options = options || {};

  if (typeof options.dir !== 'string' && !Array.isArray(options.dir)) {
    throw new Error('gulp-sass-inheritance: Missing dir in options');
  }

  if (typeof options.dir === 'string') {
    options.dir = [options.dir];
  }

  var files = [];

  function writeStream(currentFile) {
    if (currentFile && currentFile.contents.length) {
      files.push(currentFile);
    }
  }

  function recureOnImports(acc,graph,filePath){
    var fullpaths = graph.index[filePath].importedBy
    return fullpaths.reduce(function(acc,thePath){
      return acc.concat(thePath, graph.index[thePath].importedBy.reduce(function(acc, aPath){
        return acc.concat(aPath, recureOnImports([], graph, aPath))
      },[]))
    },acc)
  }

  function endStream() {
    var stream = this;
    if (files.length) {
      var allPaths = _.map(files, 'path');
      var newFiles = files;
      _.forEach(options.dir, function(dir) {
        var graph = sassGraph.parseDir(dir, options);
        _.forEach(files, function(file) {
          if (graph.index && graph.index[file.path]) {
            var fullpaths = recureOnImports([],graph, file.path);

            fullpaths.forEach(function (path) {
              if (!_.includes(allPaths, path)) {
                allPaths.push(path);
                newFiles.push(new gutil.File({
                  cwd: file.cwd,
                  base: pathRequire.join(file.cwd,dir),
                  path: path,
                  stat: fs.statSync(path),
                  contents: fs.readFileSync(path)
                }));
              }
            });

            if (options.debug) {
              console.log('File', file.path);
              console.log(' - importedBy', fullpaths);
            }
          }
        });
      });
      es.readArray(files)
        .pipe(es.through(
          function (f) {
            stream.emit('data', f);
          },
          function () {
            stream.emit('end');
          }
      ));
    } else {
      stream.emit('end');
    }
  }

  stream = es.through(writeStream, endStream);

  return stream;
}

module.exports = gulpSassInheritance;
