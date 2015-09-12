'use strict';
var gulp = require( 'gulp' );

gulp.task( 'js', [ 'lint' ], function() {
		gulp.start( 'preprocess' );
});
