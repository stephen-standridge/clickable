var env = require('../config/tasks');
// Karma configuration
// Generated on Fri Jan 23 2015 17:22:58 GMT-0500 (EST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../../',
    'plugins' : [
        'karma-jquery',
        'karma-mocha',
        'karma-sinon-chai',
        'karma-nyan-reporter',
        'karma-chai-jquery',
        'karma-chrome-launcher',
        'karma-fixture',
        'karma-html2js-preprocessor',
        'karma-json-fixtures-preprocessor'
    ],
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [ 'mocha', 'chai-jquery', 'jquery-1.8.3', 'sinon-chai', 'fixture'],

    // list of files / patterns to load in the browser, grabs the concatenated js and fixture files by default.
    files: [ 
      env.karma.fixtures + '/**/*', 
      'dist/' + env.js.name
    ],

    // fixture preprocessing allows for both html and json fixtures
    preprocessors: {
      '**/*.html'   : ['html2js'],
      '**/*.json'   : ['json_fixtures']
    },

    jsonFixturesPreprocessor: {
      variableName: '__json__'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['nyan'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
    
    // Helps to address an issue on TravisCI where activity can time out
    browserNoActivityTimeout: 30000

  });
};

