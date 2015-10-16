module.exports = function(grunt) {

  // configure the tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      build: {

        cwd: "C:/Users/Mups/NoraStuff/Udacity_FrontendDeveloper/Neighborhood Map/Neighborhood-map/",
        src: ["index.html",
        "css/style.css","js/app.js",
        "img/**",
        "bower-components/**"],
        dest: 'build/',
        expand: true
      },
    },

    clean: {
      options: {force:true},
      build: {
        src: [ 'build/**' ]
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
          'build/js/app.js': [ 'build/js/app.js' ]
        }
      }
    },

    watch: {
      scripts: {
        files: 'js/*.js',
        tasks: [ 'scripts' ]
      },
      copy: {
        files: [ 'website_opti_source/**', '!website_opti_source/**/*.js' ],
        tasks: [ 'copy' ]
      }
    },
    cssbeautifier: {
      files: ['css/*.css'],
      options : {
        indent: ' ',
        openbrace: 'end-of-line'
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'js/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    htmlmin: {                                     // Task
    dist: {                                      // Target
      options: {                                 // Target options
        removeComments: true,
        collapseWhitespace: true
      },
      files: {                                   // Dictionary of files
        'build/index.html': 'build/index.html'
      }
    }
  }
  });

  // load the tasks
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-cssbeautifier');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

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
    ['clean','copy', 'htmlmin','stylesheets', 'scripts' ]
  );

  grunt.registerTask(
    'default',
    'Watches the project for changes, automatically builds them.',
    [ 'build', 'watch' ]
  );

   grunt.registerTask(
    'check',
    ['jshint', 'cssbeautifier']);
};