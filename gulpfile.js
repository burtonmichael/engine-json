var fs = require('fs');
var gulp = require('gulp');
var jsoncombine = require('gulp-jsoncombine');
var del = require('del');
var merge = require('merge-stream');
var path = require('path');
var jsonlint = require('gulp-jsonlint')

function getFolders(dir) {
	return fs.readdirSync(dir)
	.filter(function(file) {
		return fs.statSync(path.join(dir, file)).isDirectory();
	});
}

gulp.task('combine', ['combine:temp', 'clean:dist'], function() {
	gulp.src('./.temp/*.json')
	    .pipe(jsoncombine('properties.json',function(data){
	    	return new Buffer(JSON.stringify(data));
	    }))
	    .pipe(gulp.dest('./dist'));
    del(['.temp']);
});

gulp.task('combine:temp', ['clean:temp'], function() {
   var folders = getFolders('src');

   var tasks = folders.map(function(folder) {
	  return gulp.src(path.join('src', folder, '/**/*.json'))
		.pipe(jsonlint())
		.pipe(jsonlint.reporter())
		.pipe(jsoncombine(folder + '.json',function(data){
			return new Buffer(JSON.stringify(data));
		}))
		.pipe(gulp.dest('./.temp'));
   });

   return merge(tasks);
});

gulp.task('clean:temp', function(cb) {
	del(['.temp'], cb);
});

gulp.task('clean:dist', function(cb) {
	del(['dist'], cb);
});