var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var sass = require('gulp-sass');

gulp.task('html', function() {
    return gulp.src([
            '!./src/client/html/index.html',
            './src/client/html/**/*.html'
        ]).pipe(htmlmin({collapseWhitespace: true, caseSensitive: true}))
        .pipe(gulp.dest('./build/client'));
});
gulp.task('html-index', function() {
    return gulp.src(['./src/client/html/index.html'])
        .pipe(htmlmin({collapseWhitespace: true, caseSensitive: true}))
        .pipe(gulp.dest('./build/client/app'));
});

gulp.task('sass', function(){
    return gulp.src('./src/client/sass/site.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./build/client'))
})

gulp.task('default', ['html', 'html-index', 'sass']);