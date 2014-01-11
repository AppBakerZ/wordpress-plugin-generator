"use strict;"

module.exports = function(grunt) {
  grunt.registerMultiTask("array2file", "Generates a file from an array", function() {

      // Merging options with defaults
      var options = this.options({
        contents: []
      });

      grunt.log.writeln("array2file " + JSON.stringify(options));
      //grunt.log.debug(arguments + "\n");

      if (!this.files) {
        return;
      }

      var fs = require("fs");
      var contents = options.contents;
      grunt.log.write("contents = " + contents);


      this.files.forEach(function(fileSet) {

          fs.writeFileSync(fileSet.dest, contents.join("\r\n"));

        });



    });
};