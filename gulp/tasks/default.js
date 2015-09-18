'use strict';
var gulp   = require( 'gulp' ),
    config = require( '../config/tasks' );


gulp.task( 'default', function() {
    gulp.start( 'js' );
    gulp.start( 'karma' );
    gulp.watch( config.js.src, [ 'js' ] );
    // gulp.watch( config.karma.src, [ 'karma' ] );
    ///watch all js files, run js, run karma
});
