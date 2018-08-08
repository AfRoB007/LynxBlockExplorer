var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

//javascript
gulp.task('clean:app-js',function () {
    return del([
        './public/assets/js/app.min.js'
    ]);
});
gulp.task('build:app-js',['clean:app-js'],function(){
    return gulp.src([
        './public/assets/js/jquery-2.1.0.min.js',
        './public/assets/js/popper.js',
        './public/assets/js/bootstrap.min.js',
        './public/assets/js/jquery.twbsPagination.min.js',
        './public/assets/js/particles.min.js',
        './public/assets/js/scrollreveal.min.js',
        './public/assets/js/jquery.downCount.js',
        './public/assets/js/parallax.min.js',
        './public/assets/js/particle-dark.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('site.min.js'))
        //.pipe(uglify())
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest('./public/assets/js'));
});
//css
gulp.task('clean:app-css',function () {
    return del([
        './public/assets/css/site.min.css'
    ]);
});
gulp.task('build:app-css',['clean:app-css'],function(){
    return gulp.src([
        './public/assets/css/bootstrap.min.css',
        './public/assets/css/font-awesome.min.css',
        './public/assets/css/dark.css'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('site.min.css'))
        //.pipe(uglify())
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest('./public/assets/css'));
});

gulp.task('default', ['build:app-js','build:app-css']);