var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('clean:jqplot-js',function () {
    return del([
        './public/dist/js/vendor.min.js'
    ]);
});
gulp.task('build:jqplot-js',['clean:jqplot-js'],function(){
    return gulp.src([
        './public/vendor/jqplot/jquery.jqplot.min.js',
        './public/vendor/jqplot/plugins/jqplot.dateAxisRenderer.min.js',
        './public/vendor/jqplot/plugins/jqplot.ohlcRenderer.min.js',
        './public/vendor/jqplot/plugins/jqplot.highlighter.min.js',
        './public/vendor/jqplot/plugins/jqplot.pieRenderer.min.js',
        './public/vendor/jqplot/plugins/jqplot.barRenderer.min.js',
        './public/vendor/jqplot/plugins/jqplot.categoryAxisRenderer.min.js',
        './public/javascripts/chart.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('jqplot.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest('./public/dist/js'));
});

gulp.task('build:jqplot',['build:jqplot-js']);

gulp.task('default', ['build:jqplot']);