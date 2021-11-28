var jsParent = require('../index');

var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var assert = require('stream-assert');
var gulp = require('gulp');

var assertBasename = function(basename) {
  return function(newFile) { expect(path.basename(newFile.path)).to.equal(basename) }
}

describe('gulp-js-parent', function(done) {

  describe('options', function() {
    it('should throw without dir', function () {
      expect(function(){
        jsParent({ dir: undefined })
      }).to.throw("gulp-js-parent: Missing dir in options")
    });
  });

  describe('single', function() {
    var testFolder = 'test/fixtures/single'
    it('should return a single file with no imports', function(done) {
      gulp.src([testFolder + '/index.js'])
        .pipe(jsParent({ dir: testFolder }))
        .pipe(assert.length(1))
        .pipe(assert.first(assertBasename("index.js")))
        .pipe(assert.end(done));
    })
  });

  describe('importedBy', function() {
    var testFolder = 'test/fixtures/importedBy'
    it('should return all parents importing a file', function(done) {
      gulp.src([testFolder + '/child.js'])
        .pipe(jsParent({ dir: testFolder }))
        .pipe(assert.length(3))
        .pipe(assert.first(assertBasename("child.js")))
        .pipe(assert.second(assertBasename("parent.js")))
        .pipe(assert.nth(2, assertBasename("parent2.js")))
        .pipe(assert.end(done));
    });
  });

  describe('nested', function() {
    var testFolder = 'test/fixtures/nested'
    it('should return all nested parents', function(done) {
      gulp.src([testFolder + '/d.js'])
        .pipe(jsParent({ dir: testFolder }))
        .pipe(assert.length(4))
        .pipe(assert.nth(0, assertBasename("d.js")))
        .pipe(assert.nth(1, assertBasename("c.js")))
        .pipe(assert.nth(2, assertBasename("b.js")))
        .pipe(assert.nth(3, assertBasename("a.js")))
        .pipe(assert.end(done));
    });
  });

  describe('nested ts', function() {
    var testFolder = 'test/fixtures/nested-ts'
    it('should return all nested parents', function(done) {
      gulp.src([testFolder + '/d.ts'])
        .pipe(jsParent({ dir: testFolder }))
        .pipe(assert.length(4))
        .pipe(assert.nth(0, assertBasename("d.ts")))
        .pipe(assert.nth(1, assertBasename("c.ts")))
        .pipe(assert.nth(2, assertBasename("b.ts")))
        .pipe(assert.nth(3, assertBasename("a.ts")))
        .pipe(assert.end(done));
    });
  });

});
