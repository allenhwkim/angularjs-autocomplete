'use strict';
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var stripDebug = require('gulp-strip-debug');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');

gulp.task('clean', function() {
  return gulp.src('bulid')
    .pipe(clean({force: true}));
});

gulp.task('build-js', function() {
  return gulp.src([
    'directives/auto-complete.js',
    'directives/auto-complete-multi.js',
    'directives/auto-complete-div.js',
    'services/*.js'])
    .pipe(concat('angularjs-autocomplete.debug.js'))
    .pipe(gulp.dest('build'))
    .pipe(stripDebug())
    .pipe(concat('angularjs-autocomplete.js'))
    .pipe(gulp.dest('build'))
    .pipe(uglify())
    .pipe(rename('angularjs-autocomplete.min.js'))
    .pipe(gulp.dest('build'));
});

gulp.task('build', function(callback) {
  runSequence('clean', 'build-js', callback);
});
