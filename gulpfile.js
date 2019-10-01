'use strict';

const sass = require('gulp-sass');
const { src, dest, parallel } = require('gulp');

sass.compiler = require('node-sass');

function compileJs(cb) {
  return src('lib/*.js')
    .pipe(dest('dist/js/'));
}

function copyHTML(cb) {
  return src('index.html').pipe(dest('dist/'));
}

function compileSass(cb) {
  return src('scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('dist/css'));
}

exports.compileSass = compileSass;
exports.default = parallel(compileJs, compileSass, copyHTML);