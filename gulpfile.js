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
var gutil = require('gulp-util');

var srcDir = './src/';
var baseDir = './src/base/';
var catDir = './src/categories/';
var tempDir = './src/temp/';
var destDir = './dist/';

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

gulp.task('merge', ['combine:base', 'clean:dest'], function() {
    gulp.src([tempDir + '/base.json', tempDir + '/properties.json'])
        .pipe(extend('properties.json'))
        .pipe(gulp.dest(destDir));

    return del([tempDir]);
});

gulp.task('combine:base', ['combine:categories'], function() {
    return gulp.src(baseDir + '/*.json')
        .pipe(jsonlint())
        .pipe(jsonlint.reporter())
        .pipe(jsoncombine('base.json', function(data) {
            return new Buffer(JSON.stringify(data));
        }))
        .pipe(transform(function(data) {
            return {
                "base": data
            };
        }))
        .pipe(gulp.dest(tempDir));
});

gulp.task('combine:categories', ['combine:properties'], function() {
    return gulp.src(tempDir + '/*.json')
        .pipe(jsoncombine('properties.json', function(data) {
            return new Buffer(JSON.stringify(data));
        }))
        .pipe(transform(function(data) {
            return {
                "categories": data
            };
        }))
        .pipe(gulp.dest(tempDir));
});

gulp.task('combine:properties', ['clean:temp'], function() {
    var folders = getFolders(catDir);
    var tasks = folders.map(function(folder) {
        return gulp.src(path.join(catDir, folder, '/**/*.json'))
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

gulp.task('clean:dest', function(cb) {
    del([destDir], cb);
});

gulp.task('default', ['merge']);
