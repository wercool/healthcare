const gulp                  = require('gulp');
const browserify            = require('browserify');
const source                = require('vinyl-source-stream');
const buffer                = require('vinyl-buffer');
const color                 = require('gulp-color');

var initObj = {};

gulp.task('compile', function() {
    return browserify(initObj.jssrc)
    .transform('babelify', {
        presets: ['env']
    })
    .bundle()
    .pipe(source(initObj.jssrc))
    .pipe(buffer())
    .pipe(gulp.dest('../public/js'))
});

gulp.task('watch', function(){
    if (process.argv.indexOf('--jssrc') > -1)
    {
        initObj.jssrc = process.argv[process.argv.indexOf('--jssrc') + 1];
        if (!initObj.jssrc) {
            console.log(color('--jssrc [?] is missing!', 'RED'));
            process.exit();
        }
    } else {
        console.log(color('--jssrc is missing!', 'RED'));
        process.exit();
    }
    gulp.watch([
        '**/*.js',
        '!node_modules/**',
        '!./gulpfile.js'], 
        ['compile']);
});