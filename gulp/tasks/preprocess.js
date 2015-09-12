'use strict';
var gulp       = require( 'gulp' ),
		config     = require( '../config/tasks' ).js,
		babel      = require( 'gulp-babel' ),
		concat     = require( 'gulp-concat' ),
		sourcemaps = require( 'gulp-sourcemaps' );

gulp.task( 'preprocess', function() {
  return gulp.src( config.src )
  	.pipe(sourcemaps.init())
  	.pipe( babel() )
  	.pipe( concat( config.name ) )
  	.pipe(sourcemaps.write())
    .pipe( gulp.dest( config.dest ) );
});
