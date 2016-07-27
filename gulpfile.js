var gulp = require('gulp');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var rename = require('gulp-rename');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');


var MODE = "production"; // oder 'development'

//Bilder verkleinern
gulp.task('images', function() {
  return gulp.src('src/img/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('build/assets/images'));
});

//CSS verkleinern und autoprefixen
gulp.task('css', function() {
		// je nach Modus wird dementsprechend die CSS Datei erstellt.
			if (MODE ==='production') {
			var cssmode = 'compressed';
			}else{cssmode='expanded';}

	return gulp.src('src/sass/**/*.scss')
		// on error wird benötigt wegen Fehlerausgabe
		.pipe(sass({outputStyle: cssmode}).on('error', sass.logError))
		.pipe(gulpif(MODE === 'production',
			postcss([
				autoprefixer({
					browsers: ['last 2 version', 'ie 9', 'ie 10']
				})
			
		])))
		.pipe(rename('main.css'))
		.pipe(gulp.dest('build/assets/css'));
});

//js verkleinern

gulp.task('js', function() {
	if (MODE ==='production') {
		//production
		 return gulp.src('src/js/**/*.js')
		.pipe(concat('all.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('build/assets/js/'))
			}else{
				//development
				return gulp.src('src/js/**/*.js')
				.pipe(concat('all.min.js'))
				.pipe(gulp.dest('build/assets/js/'))
			}
		
});

//html verkleinern
gulp.task('minhtml', function() {
  	if (MODE ==="production"){
  		return gulp.src('src/*.{html,php}')
    	.pipe(htmlmin({collapseWhitespace: true, useShortDoctype: true, html5: true}))
    	.pipe(gulp.dest('build'));
  	}else{
  		return gulp.src('src/*.{html,php}')
    	.pipe(htmlmin({collapseWhitespace: false, useShortDoctype: false, html5: false}))
    	.pipe(gulp.dest('build'));
  	}

  	
});


//Watch Tasks erstellen. $ gulp watch aufrufen
gulp.task('watch', function() {
	gulp.watch('src/img/*.{png,jpg,gif}', ['images']);
	gulp.watch('src/sass/**/*.scss', ['css']);
	gulp.watch('src/js/**/*.js', ['js']);
	gulp.watch('src/*.{html, php}', ['minhtml']);

});

gulp.task('default', ['images', 'css', 'js', 'minhtml']);