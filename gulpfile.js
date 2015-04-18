var gulp = require('gulp');
var jsoncombine = require('gulp-jsoncombine');
var del = require('del');

gulp.task('combine', ['clean'], function() {
	gulp.src('./src/*.json')
	    .pipe(jsoncombine('properties.json',function(data){
	    	return new Buffer(JSON.stringify(data));
	    }))
	    .pipe(gulp.dest('./dist'));
});

gulp.task('clean', function(cb) {
	del(['dist'], cb);
});