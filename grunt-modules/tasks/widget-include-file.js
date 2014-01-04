"use strict;"

module.exports = function(grunt) {
  grunt.registerMultiTask("generate-widget-include-file", "Generates temp/widgets.php to be included in plugin file", function() {

      //grunt.log.write("generate-widget-include-file " + JSON.stringify(this.files) + "\n");

      //grunt.log.debug(arguments + "\n");

      if (!this.files) {
        return;
      }

      var fs = require("fs");


      this.files.forEach(function(fileSet) {
          //grunt.log.write("fileSet = " + fileSet);
          var contents = [];
          var l = "require( plugin_dir_path( __FILE__ ) . 'inc/admin-settings.php' );"
          contents = fileSet.orig.src.map(function(srcFile) {
              //var filename  = path.basename(srcFile),
              return "require( plugin_dir_path( __FILE__ ) . 'inc/" + srcFile + "' );"
            });

          fs.writeFileSync(fileSet.dest, contents.join("\r\n"));

        });



    });
};