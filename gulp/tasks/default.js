'use strict';
var gulp   = require( 'gulp' ),
    config = require( '../config/tasks' );


gulp.task( 'default', function() {
    gulp.start( 'js' );
    gulp.watch( config.js.src, [ 'js' ] );
    gulp.watch( config.tests.src, [ 'karma' ] );
    ///watch all js files, run js, run karma
});
