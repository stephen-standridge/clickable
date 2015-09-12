var gulp    = require( 'gulp' ),
		config  = require( '../config/tasks' ).js,
		jsLint  = require( 'gulp-jshint' );

gulp.task( 'lint', function() {
  return gulp.src( config.src )
		.pipe( jsLint( config.guidelines ) )
		.pipe( jsLint.reporter( 'jshint-stylish' ) );
});
