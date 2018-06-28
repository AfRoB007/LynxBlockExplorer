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

//javascript
gulp.task('clean:app-js',function () {
    return del([
        './public/dist/js/app.min.js'
    ]);
});
gulp.task('build:app-js',['clean:app-js'],function(){
    return gulp.src([
        './public/vendor/jquery/jquery.min.js',
        './public/vendor/bootstrap/bootstrap.min.js',
        './public/vendor/moment/moment.min.js',
        './public/vendor/data-tables/jquery.dataTables.min.js',
        './public/vendor/responsive/dataTables.responsive.min.js',
        './public/vendor/data-tables/dataTables.bootstrap.js',
        './public/vendor/esimakin-twbs-pagination/jquery.twbsPagination.min.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest('./public/dist/js'));
});
//css
gulp.task('clean:app-css',function () {
    return del([
        './public/dist/js/site.min.css'
    ]);
});
gulp.task('build:app-css',['clean:app-css'],function(){
    return gulp.src([
        './public/themes/Spacelab/bootstrap.min.css',
        './public/vendor/data-tables/dataTables.bootstrap.css',
        './public/stylesheets/style.css'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('site.min.css'))
        //.pipe(uglify())
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest('./public/dist/css'));
});

gulp.task('default', ['build:jqplot-js','build:app-js','build:app-css']);