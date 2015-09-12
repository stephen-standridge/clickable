'use strict';
var gulp       = require( 'gulp' ),
		config     = require( '../config/tasks' ).production,
		size       = require( 'gulp-filesize' ),
		uglify     = require( 'gulp-uglify' ),
		sourcemaps = require( 'gulp-sourcemaps' ),	
		concat     = require( 'gulp-concat' );

gulp.task( 'min', function() {
  return gulp.src( config.src )
  	.pipe( sourcemaps.init() )
    .pipe( uglify() )
  	.pipe( concat( config.name ) )
  	.pipe( sourcemaps.write() )
    .pipe( gulp.dest( config.dest ) )    
    .pipe( size() );
});
