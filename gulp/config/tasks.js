module.exports = {
  js: {
    src: [ './clickable/main.js' ],
    guidelines: './gulp/config/.jshintrc',
    dest: './dist',
    name: 'clickable.js'
  },
  production: {
    src: [ './dist/clickable.js', './clickable/module.js' ],
    name: 'clickable.min.js',
    dest: './dist'
  },
  karma: {
    config: '/gulp/config/karma.conf.js',
    tests: 'spec/tests/',
    fixtures: 'spec/fixtures/',
  },
};