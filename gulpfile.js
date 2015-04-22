var fs = require('fs');
var gulp = require('gulp');
var jsoncombine = require('gulp-jsoncombine');
var del = require('del');
var merge = require('merge-stream');
var path = require('path');
var jsonlint = require('gulp-jsonlint');
var extend = require('gulp-extend');
var concat = require('gulp-concat-json');
var transform = require('gulp-json-transform');
var wrap = require('gulp-wrap');

var srcDir = './src/';
var tempDir = './src/temp/';
var destDir = './dist/';

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

gulp.task('merge', ['combine:categories'], function() {
    gulp.src([srcDir + '/categories.json', tempDir + '/properties.json'])
        .pipe(extend('properties.json'))
        .pipe(gulp.dest(destDir));

    return del([tempDir]);
});

gulp.task('combine:categories', ['combine:properties', 'clean:properies'], function() {
    return gulp.src(tempDir + '/*.json')
        .pipe(jsoncombine('properties.json', function(data) {
            return new Buffer(JSON.stringify(data));
        }))
        .pipe(gulp.dest(tempDir));
});

gulp.task('combine:properties', ['clean:temp'], function() {
    var folders = getFolders(srcDir);

    var tasks = folders.map(function(folder) {
        return gulp.src(path.join(srcDir, folder, '/**/*.json'))
            .pipe(jsonlint())
            .pipe(jsonlint.reporter())
            .pipe(jsoncombine(folder + '.json', function(data) {
                return new Buffer(JSON.stringify(data));
            }))
            .pipe(transform(function(data) {
                return {
                    "parameter": folder,
                    "properties": data
                };
            }))
            .pipe(gulp.dest(tempDir));
    });

    return merge(tasks);
});

gulp.task('clean:temp', function(cb) {
    del([tempDir], cb);
});

gulp.task('clean:properies', function(cb) {
    del([destDir], cb);
});

gulp.task('default', ['merge']);
