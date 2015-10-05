module.exports = function(grunt) {

  // configure the tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      build: {
         cwd: 'website_opti_source',
        src: [ '**' ],
        dest: 'build',
        expand: true
      },
    },

    clean: {
      options: {force:true},
      build: {
        src: [ 'build' ]
      }
    },

    cssmin: {
      build: {
        files: {
          'build/css/style.css': [ 'build/css/style.css' ]
        }
      }
    },

    uglify: {
      build: {
        files: {
          'build/views/js/main.js': [ 'build/views/js/main.js' ]
        }
      }
    },

    watch: {
      scripts: {
        files: 'website_opti_source/**/*.js',
        tasks: [ 'scripts' ]
      },
      copy: {
        files: [ 'website_opti_source/**', '!website_opti_source/**/*.js' ],
        tasks: [ 'copy' ]
      }
    }

  });

  // load the tasks
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');


  // define the tasks
  grunt.registerTask(
    'stylesheets',
    'Compiles the stylesheets.',
    ['cssmin' ]
  );

  grunt.registerTask(
    'scripts',
    'Compiles the JavaScript files.',
    [ 'uglify']
  );

  grunt.registerTask(
    'build',
    'Compiles all of the assets and copies the files to the build directory.',
    [ 'clean', 'copy', 'stylesheets', 'scripts' ]
  );

  grunt.registerTask(
    'default',
    'Watches the project for changes, automatically builds them.',
    [ 'build', 'watch' ]
  );
};