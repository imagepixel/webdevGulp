var gulp = require('gulp');
var md5 = require("gulp-md5-plus");
var del = require('del');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var rename = require('gulp-rename');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var plumber = require('gulp-plumber');
var beeper = require('beeper');
var jsonfile = require('jsonfile');

//Error Helper
function onError(err){
	beeper();
	console.log(err);
}

var MODE = "dev"; // production or 'dev'


//Clean  your images
gulp.task('cleanImages', function(){
	return del(['./build/assets/img/']);
});

//Clean all your css
gulp.task('cleanCSS', function(){
	return del(['./build/assets/css/']);
});

//Copy data
gulp.task('copyfiles', function() {
  		return gulp.src('src/*.{php,html,inc}')
    	.pipe(gulp.dest('./build/'));
  	}


);

//uglify CSS
gulp.task('css', ['copyfiles'], function() {
		// je nach Modus wird dementsprechend die CSS Datei erstellt.
			if (MODE ==='production') {
				var cssmode = 'compressed';
			}else{cssmode='expanded';}

	return gulp.src('src/sass/style.scss')
		.pipe(plumber({
				errorHandler:onError
		}))
		// on error wird benötigt wegen Fehlerausgabe
		.pipe(sass({outputStyle: cssmode}).on('error', sass.logError))
		.pipe(postcss([autoprefixer({
					browsers: ['last 2 version','ie 9','ie 10']
				})
		]))
		.pipe(rename('main.css'))
		.pipe(md5(10,'./build/*.{php,html,inc}'))
		.pipe(gulp.dest('build/assets/css/'))
});

//shrink your images
gulp.task('images', ['css'], function() {
  return gulp.src('src/img/**/*')
  	   .pipe(plumber({
				errorHandler:onError
		}))
       .pipe(md5(10 ,'./build/assets/css/*.css',{
        	dirLevel : 1
        }))
    .pipe(imagemin())
    .pipe(gulp.dest('./build/assets/img/'));
});



//uglify js

gulp.task('js', function() {
	if (MODE ==='production') {
		//production
		 return gulp.src('src/js/main.js' )
		  .pipe(plumber({
				errorHandler:onError
		}))
		.pipe(concat('all.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./build/assets/js/'));
			}else{
				//development
				return gulp.src('src/js/main.js')
				.pipe(plumber())
				.pipe(concat('all.min.js'))
				.pipe(gulp.dest('./build/assets/js/'))
			}

});

gulp.task('browserify', function(){
	return browserify('src/js/app.js')
	.bundle()
	  .pipe(plumber({
				errorHandler:onError
		}))
	.pipe(source('bundle.js'))
	.pipe(gulp.dest('./build/assets/js/'))
});


//Clean all your files
gulp.task('clean', function(){
	return del(['./build/']);
});

//gulp watch tast
gulp.task('watch', function() {
	gulp.watch('src/img/*.{png,jpg,gif,svg}', ['images']);
	gulp.watch('src/sass/**/*.scss', ['css']);
	gulp.watch('src/js/**/*.js', ['js']);
	gulp.watch('src/*.{html,php,inc}', ['copyfiles']);

});
//gulp default tast

gulp.task('default', ['cleanImages', 'cleanCSS', 'copyfiles',  'css', 'images', 'js', 'browserify']);
