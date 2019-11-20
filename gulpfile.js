'use strict';

const { src, dest, parallel, watch } = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;

sass.compiler = require('node-sass');

function compileJs(cb) {
  return src(['src/lib/*.js', 'src/visor.js'])
    .pipe(concat('visor.min.js')) 
    //.pipe(uglify())
    .pipe(dest('dist/js/'));
}

function compileJSLanding(cb) {
  return src('src/index.js')
        .pipe(dest('dist/js/'));
}

function copyHTML(cb) {
  return src('src/*.html').pipe(dest('dist/'));
}

function copyLibraries(cb) {
  return src('src/libraries/*.js')
    .pipe(dest('dist/js/'));
}

function copyAssets(cb) {
  return src('src/assets/img/**/*').pipe(dest('dist/img'))
}

function compileSass(cb) {
  return src(['src/scss/pages/index.scss', 'src/scss/pages/visor.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('dist/css/'));
}

exports.default = parallel(compileJs, compileSass, copyAssets, copyHTML, copyLibraries);

exports.compileJSLanding = compileJSLanding;

exports.dev = function() {
  watch('src/scss/**/*.scss', compileSass);
  watch('src/lib/**/*.js', compileJs);
  watch('src/index.js', compileJSLanding);
  watch('src/*.html', copyHTML);
}
