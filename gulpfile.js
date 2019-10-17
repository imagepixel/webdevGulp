'use strict'
const gulp = require('gulp') // Automate and enhance your workflow
const del = require('del') // It also protects you against deleting the current working directory and above
const sass = require('gulp-sass') // Sass plugin for Gulp.
const imagemin = require('gulp-imagemin')
const newer = require('gulp-newer')
const rename = require('gulp-rename')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const concat = require('gulp-concat')
const plumber = require('gulp-plumber')
const eslint = require('gulp-eslint')
const beeper = require('beeper')
const cssnano = require('cssnano')

// Error Helper
function onError (err) {
  beeper()
  console.log(err)
}

// Clean assets
function cleanImages () {
  return del(['./build/assets/img/'])
}
function cleanCSS () {
  return del(['./build/assets/css/'])
}
function cleanManifest () {
  return del(['./manifest.json'])
}
function cleanFiles () {
  return del(['./build/*.{php,inc,html}'])
}

// Copy data
function copyFiles () {
  return gulp.src('src/*.{php,html,inc}')
    .pipe(gulp.dest('./build/'))
}

// CSS task
function css () {
  return gulp
    .src('src/sass/style.scss')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sass({ outputStyle: 'cssmode' }).on('error', sass.logError))
    .pipe(gulp.dest('./_site/assets/css/'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(postcss([cssnano(), autoprefixer()]))
    .pipe(gulp.dest('build/assets/css/'))
}

// Optimize Images
function images () {
  return gulp
    .src('src/img/**/*')
    .pipe(newer('./build/assets/img/'))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest('./build/assets/img/'))
}

// Lint scripts
function scriptsLint () {
  return gulp
    .src(['src/js/main.js'])
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}
// minify scripts
function scripts () {
  return (
    gulp
      .src(['src/js/main.js'])
      .pipe(plumber({
        errorHandler: onError
      }))
    // .pipe(webpackstream(webpackconfig, webpack))
    // folder only, filename is specified in webpack config
      .pipe(concat('all.min.js'))
      .pipe(gulp.dest('./build/assets/js/'))
  )
}

// Clean all your files

function clean () {
  return del(['./build/'])
}

// Watch files
function watchFiles () {
  gulp.watch('src/sass/**/*.scss', css)
  gulp.watch('./assets/js/**/*', gulp.series(scriptsLint, scripts))
  gulp.watch(
    [
      './_includes/**/*',
      './_layouts/**/*',
      './_pages/**/*',
      './_posts/**/*',
      './_projects/**/*'
    ]
  )
  gulp.watch('src/img/*.{png,jpg,gif,svg}', images)
}

// define complex tasks
const js = gulp.series(scriptsLint, scripts)
const build = gulp.series(copyFiles, cleanImages, cleanCSS, cleanFiles, cleanManifest, gulp.parallel(css, images, js))
const watch = gulp.parallel(watchFiles)

// export tasks

exports.images = images
exports.css = css
exports.js = js
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = build
