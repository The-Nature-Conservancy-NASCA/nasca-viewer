'use strict';

const { src, dest, parallel, watch } = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');

sass.compiler = require('node-sass');

function compileJs(cb) {
  return src(['lib/*.js'])
    .pipe(concat('bundle.js'))
    .pipe(dest('dist/js/'));
}

function copyHTML(cb) {
  return src('*.html').pipe(dest('dist/'));
}

function copyAssets(cb) {
  return src('assets/img/*').pipe(dest('dist/img'))
}

function compileSass(cb) {
  return src('scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('dist/css'));
}

exports.default = parallel(compileJs, compileSass, copyAssets, copyHTML);

exports.dev = function() {
  watch('scss/**/*.scss', compileSass);
  watch('lib/**/*.js', compileJs);
  watch('*.html', copyHTML);
}
