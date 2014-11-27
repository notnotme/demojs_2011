module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      all: [
        //'scripts/mainmenu.js',
        //'screen-!!m/js/intro.js',
        //'screen-credits/index.html',
        //'screen-credits/**/*.js',
        //'screen-pf/index.html',
        //'screen-pf/*.js',
        //'screen-zuul/index.js'
      ]
    },
    connect: {
      server: {
        options: {
          port: 8000,
          base: '.'
        }
      }
    },
    watch: {
      main: {
        files: [
          'Gruntfile.js',
          'screen-!!m/index.html',
          'screen-credits/index.html',
          'screen-credits/**/*.js',
          'screen-pf/index.html',
          'screen-pf/*.js',
          'screen-zuul/index.js'
        ],
          tasks: 'default'
      }
    },
  });

  // Default task.
  grunt.registerTask('default', ['jshint']);
  grunt.registerTask( 'serve', [ 'connect', 'watch'] );
};
