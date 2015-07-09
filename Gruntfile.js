module.exports = function(grunt) {
  grunt.initConfig({
    clean: {
      build: [ 'dist' ] 
    },
    bower: {
      dev: { 
        dest: 'dist/deps',
        js_dest: 'dist/
      }
    },
    less: {
      development: {
        options: {
          paths: [ 'web/src', 'dist/deps/less' ]
        },
        files: {
           'dist/web/messages/messages.css' : 'web/src/css/messages.less'
        }
     }
   },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');  
  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-contrib-less');  
  grunt.loadNpmTasks('grunt-bowercopy');

  grunt.registerTask('default', ['clean','bower','less']);
};


