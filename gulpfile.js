var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');

gulp.task('html', function() {
    return gulp.src('./src/client/html/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./build/client/'))
});

gulp.task('default', ['html']);