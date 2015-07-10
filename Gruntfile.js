module.exports = function(grunt) {
  grunt.initConfig({
    clean: {
      build: [ 'dist' ] 
    },
    bower: {
      dev: {
        dest: 'dist/web/'
      }
    },
    less: {
      development: {
        options: {
          paths: [ 'dist/web/css','bower_components/bootstrap/less' ]
        },
        files: {
           'dist/web/css/messages.css' : 'dist/web/css/messages.less',
           'dist/web/css/bootstrap.css' : 'dist/web/less/bootstrap.less'
        }
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'web/src/' ,src: ['js/**'], dest: 'dist/web/'},
          {expand: true, cwd: 'web/src/' ,src: ['css/**'], dest: 'dist/web/'},
          {expand: true, cwd: 'web/src/html' ,src: ['**'], dest: 'dist/web/'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');  
  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-contrib-less');  
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['clean','copy','bower','less']);
};


