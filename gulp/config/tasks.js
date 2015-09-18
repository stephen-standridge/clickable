module.exports = {
  js: {
    src: [ './clickable/ClickableCautions.js', './clickable/ClickableConstructor.js', './clickable/ClickableController.js', './clickable/ClickableContext.js', './clickable/Clickable.js' ],
    guidelines: './gulp/config/.jshintrc',
    dest: './dist',
    name: 'clickable.js'
  },
  production: {
    src: [ './dist/clickable.js' ],
    name: 'clickable.min.js',
    dest: './dist'
  },
  karma: {
    config: '/gulp/config/karma.conf.js',
    tests: 'spec/tests/',
    fixtures: 'spec/fixtures/',
    src: 'spec/tests/*.js'
  },
};