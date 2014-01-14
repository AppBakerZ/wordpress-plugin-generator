"use strict";

/**************************************
 * Author: Kashif Iqbal Khan
 * Email: kashiif@gmail.com
 * License: MIT
 * Copyright (c) 2013-2014 Kashif Iqbal Khan
 **************************************/

var distdir = "dist/",
    tempDir = distdir + "temp/",
    srcDir = "src/";  // Path of directory where source code resides

module.exports = function(grunt) {

  var path  = require("path"),
      fs = require("fs");

  var pkg = grunt.file.readJSON("package.json"),
    versionForFileSystem = pkg.version.replace(/\./g, "-");

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,

    clean: {
      prod: [tempDir]
    },

    // Copy files to tempDir, and only change things in there
    copy: {
      prod: {
        files: [
          {expand: true, cwd: srcDir, src : ["**/*.*"], dest: tempDir }
        ]
      },
    },


    "string-replace": {

      plugin_file: { /* Task to replace tokens in plugin file */
        options: {
          replacements: [{
            pattern: /___version___/g,
            replacement: pkg.version
          }]
        },
        files: [
          {expand: true, dest: tempDir, cwd: tempDir, src : ["*.php"] }
        ]
      }
    },

    "generate-translation": {
      full: {
        options: {
          method:'touch'
        },
        files: {
          "src/lang/abz-course-management.pot": [ "src/inc/*.php", "!**/index.php"]
        }
      },

      partial: {
        files: {
          "src/lang/abz-course-management.pot": [ "src/inc/*.php", "!**/index.php"]
        }
      }
    },

    compress: {
      prod: {
        options: {
          archive: distdir + pkg.name + "-" + pkg.version + ".zip",
          mode: "zip"
        },
        files: [ { expand: true, cwd: tempDir, src: "**/**" }]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-string-replace");

  grunt.loadNpmTasks("grunt-contrib-compress");

  grunt.loadTasks("./grunt-modules/tasks/");

  grunt.registerTask("index-php", "Copies empty index.php file to every folder", function() {

    // Force task into async mode and grab a handle to the "done" function.
    var done = this.async();

    var fs = require('fs'),
      copyHelper  = require("./grunt-modules/copyhelper");

    copyHelper.walk(tempDir, function(error, found) {

      if (error) {
        grunt.fail.fatal(error);
        done();
        return;
      }

      found.dirs.forEach(function(item){
        fs.writeFileSync( path.resolve(path.join(item, "index.php")) , "<?php\r\n");
      });

      done();

    });


  });



  // Default task(s).
  grunt.registerTask("default", ["clean", "generate-translation:partial", "copy", "string-replace", "index-php", "compress"]);

  grunt.registerTask("l8n", ["generate-translation:full"]);

};