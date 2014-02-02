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
    tempDir: tempDir,

    clean: {
      prod: [tempDir]
    },

    // Copy files to tempDir, and only change things in there
    copy: {
      prod: {
        files: [
          {expand: true, cwd: srcDir, src : ["**/*.*", "!{plugin-slug}.php"], dest: tempDir }
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

    preprocess: {
      options: {
        // NOTE that if context is defined in the task, it will replace the global context, (not merge it)
        // This looks like a grunt bug where deep merging is not performed for options
        context : {

        }
      },
      prod: {
        options: {
          //inline: true,
          context : {
            PRODUCTION: true
          }
        },
        files: {
           "<%=tempDir%>{plugin-slug}.php": [ srcDir + "{plugin-slug}.php"]
        }
      },
      demo: {
        options: {
        },
        files: {
          "<%=tempDir%>{plugin-slug}.php": [ srcDir + "{plugin-slug}.php"]
        }
      }

    },

    "generate-translation": {
      full: {
        options: {
          method:'touch'
        },
        files: {
          "src/lang/{plugin-slug}.pot": [ "src/inc/*.php", "!**/index.php"]
        }
      },

      partial: {
        files: {
          "src/lang/{plugin-slug}.pot": [ "src/inc/*.php", "!**/index.php"]
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

  grunt.loadNpmTasks("grunt-preprocess");
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
  grunt.registerTask("default", ["clean", /*"generate-translation:partial",*/ "copy", "preprocess:prod", "string-replace", "index-php", "compress"]);

  grunt.registerTask("demo", ["clean", /*"generate-translation:partial",*/    "copy", "preprocess:demo", "string-replace", "index-php", "compress"]);

  grunt.registerTask("l8n", ["generate-translation:full"]);

};