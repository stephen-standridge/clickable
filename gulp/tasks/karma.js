'use strict';
var env              = require( '../config/tasks' ).karma,
		gulp             = require( 'gulp' ),
		karma            = require( 'karma' ),
		args             = require( 'yargs' ).argv,
		sysNotifier      = require( '../util/sysNotifier' ),
		karmaParseConfig = require( 'karma/lib/config' ).parseConfig;

function runKarma( options, done ) {
	var configFilePath = process.cwd() + env.config;
	var config = karmaParseConfig( configFilePath, {} );

    Object.keys( options ).forEach( function( key ) {
    	if( key === 'files' ){
    		config[ key ].push( options[ key ] );
    	}else{
	      config[ key ] = options[ key ];    		
    	}
    });

  var server = new karma.Server( config, done );	
  server.start();
}

function processFile( file ){
	var added = file || '*';
			added += '.js';
	var suite = env.tests + added;
	return suite;
}

function processRun( bool ){
	if( bool === 'false' ){
		return false;
	}
	return true;
}

gulp.task( 'karma', function(){
	runKarma({ singleRun: processRun( args.single ), 
						 files: processFile( args.file ) }, sysNotifier );
});

module.exports = runKarma;
