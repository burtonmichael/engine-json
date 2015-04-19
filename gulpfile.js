var fs = require('fs');
var gulp = require('gulp');
var jsoncombine = require('gulp-jsoncombine');
var del = require('del');
var merge = require('merge-stream');
var path = require('path');
var jsonlint = require('gulp-jsonlint');
var extend = require('gulp-extend');
var concat = require("gulp-concat-json");
var transform = require("gulp-json-transform");

function getFolders(dir) {
	return fs.readdirSync(dir)
	.filter(function(file) {
		return fs.statSync(path.join(dir, file)).isDirectory();
	});
}

gulp.task('merge', ['combine:categories'], function() {
	gulp.src(['./src/categories.json', './.temp/properties.json'])
		.pipe(extend('categories.json'))
	    .pipe(gulp.dest('./dist'));

    return del(['./.temp']);
});

gulp.task('combine:categories', ['combine:properties', 'clean:dist'], function() {
	return gulp.src('./.temp/*.json')
	    .pipe(jsoncombine('properties.json',function(data){
	    	return new Buffer(JSON.stringify(data));
	    }))
	    .pipe(gulp.dest('./.temp'));
});

gulp.task('combine:properties', ['clean:temp'], function() {
   var folders = getFolders('src');

   var tasks = folders.map(function(folder) {
	  return gulp.src(path.join('src', folder, '/**/*.json'))
		.pipe(jsonlint())
		.pipe(jsonlint.reporter())
		.pipe(concat(folder + '.json'))
		.pipe(transform(function(data) {
	        return {
	            properties: data
	        };
	    }))
		.pipe(gulp.dest('./.temp'));
   });

   return merge(tasks);
});

gulp.task('clean:temp', function(cb) {
	del(['./.temp'], cb);
});

gulp.task('clean:dist', function(cb) {
	del(['./dist'], cb);
});

gulp.task('default', ['merge']);