module.exports = function(grunt) {
  grunt.initConfig({
    clean: {
      build: [ 'dist' ]
    },
    bower: {
      dev: {
        dest: 'dist',
        js_dest: 'dist/js/',
        css_dest: 'dist/css/',
        less_dest: 'dist/',
        options: {
          packageSpecific: {
            //'bootstrap': {
            //  stripGlobBase: true
            //}
          }

        }
      }
    },
    less: {
      development: {
        options: {
          paths: [ 'web/src/css' ]
        },
        files: {
           'dist/web/css/messages.css' : 'web/src/css/messages.less'

        }
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'web/src/' ,src: ['js/**'], dest: 'dist/web/'},
          {expand: true, cwd: 'web/src/html' ,src: ['**'], dest: 'dist/web/'},
          {expand: true, cwd: 'bower_components/bootstrap/dist' ,src: ['**'], dest: 'dist/web/'},
          {expand: true, cwd: 'bower_components/jquery/dist' ,src: ['**'], dest: 'dist/web/js'},
          {expand: true, cwd: 'bower_components/requirejs' ,src: ['*.js'], dest: 'dist/web/'},
          {expand: true, cwd: 'bower_components/lodash' ,src: ['*.js'], dest: 'dist/web/js'}
        ]
      }
    },
    watch: {
      scripts: {
        files: ['web/src/js/**','web/src/html**'],
        tasks: ['copy'],
        options: {
        }
      },
      less: {
        files: ['web/src/css/**'],
        tasks: ['less'],
        options: {
        }
      },
    },
    symlink: {
      data: {
        dest: 'dist/web/data',
        relativeSrc: '../../data/out',
        options: {type: 'dir'}
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');  
  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-contrib-less');  
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-symlink');

  grunt.registerTask('default', ['clean','copy','less','symlink']);
};


