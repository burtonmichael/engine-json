var gulp = require('gulp');
var jsoncombine = require("gulp-jsoncombine");
 


gulp.task('default', function() {
	gulp.src("./src/*.json")
	    .pipe(jsoncombine("result.json",function(data){
	    	return new Buffer(JSON.stringify(data));
	    }))
	    .pipe(gulp.dest("./dist"));
});