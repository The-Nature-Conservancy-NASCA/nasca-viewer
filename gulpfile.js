'use strict';

const { src, dest, parallel, watch } = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;

sass.compiler = require('node-sass');

function compileJsVisor(cb) {
  return src(['src/lib/**/*.js', 'src/visor.js'])
    .pipe(concat('visor.min.js')) 
    //.pipe(uglify())
    .pipe(dest('dist/js/'));
}

function compileJSLanding(cb) {
  return src(['src/lib/repositories/*.js', 'src/lib/store.js', 'src/index.js'])
        .pipe(concat('index.min.js')) 
        //.pipe(uglify())
        .pipe(dest('dist/js/'));
}

function copyHTML(cb) {
  return src('src/**/*.html').pipe(dest('dist/'));
}

function copyLibraries(cb) {
  return src('src/libraries/*.js')
    .pipe(dest('dist/js/'));
}

function copyJSON(cb) {
  return src('src/json/*.json')
    .pipe(dest('dist/json/'))
}

function copyAssets(cb) {
  return src('src/assets/img/**/*').pipe(dest('dist/img'))
}

function compileSass(cb) {
  return src(['src/scss/pages/index.scss', 'src/scss/pages/visor.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('dist/css/'));
}

exports.default = parallel(compileJsVisor, compileJSLanding, compileSass, copyAssets, copyHTML, copyLibraries, copyJSON);

exports.dev = function() {
  watch('src/scss/**/*.scss', compileSass);
  watch('src/lib/**/*.js', parallel(compileJsVisor, compileJSLanding));
  watch('src/index.js', compileJSLanding);
  watch('src/visor.js', compileJsVisor);
  watch('src/**/*.html', copyHTML);
  watch('src/json/*.json', copyJSON);
}
