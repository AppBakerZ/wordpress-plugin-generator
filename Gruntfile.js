"use strict;"
/**************************************************************
* Author:    Kashif Iqbal Khan
* Email:     kashiif@gmail.com
* Copyright: 2013 AppBakerZ (appbakerz.com)
***************************************************************/

function extend(defaults, override){
    for(var key in override) {
        if(override.hasOwnProperty(key)) {
            if (typeof override[key] == "object") {
              extend(defaults[key], override[key]);
            }
            else {
              defaults[key] = override[key];
            }
        }
    }
    return defaults;
}

function copyValueIfMissing(obj, key1, key2){ 
  if (!obj.hasOwnProperty(key1) || obj[key1].length == 0) {
    obj[key1] = obj[key2];
  }
}

function isValidIdentifier(name) {
  return true;
}

function makeValidIdentifier(name) {
  return name.trim().replace(/\W+/g, "");
}

module.exports = function(grunt) {

  var path  = require("path");

  var userParams = grunt.file.readJSON("build.json"),
      buildParams = {
        "author-name": "",
        "author-uri": "",
        "author-email": "",
        "owner-name": "",
        "owner-uri": "",
        "owner-email": "",
        "plugin-name": "",
        "plugin-slug": "",
        "plugin-desc": "",
        "plugin-uri": "",
        "options": {
          "settings-page": true
        }
      };
  
  // Valid that user has provided some values for required parameters in build.json
  var missing = ["plugin-name", "author-name", "author-email"].filter(function(item) {
      var v = userParams[item]; 
      return (!v || v.trim().length == 0);
    });
    
  if (missing.length) {
    grunt.fail.fatal("Not found valid values for: " + missing);
    return;
  }  
    
  extend(buildParams, userParams);
  for(var key in buildParams) {
      if(key != "options" && buildParams.hasOwnProperty(key)) {
        buildParams[key] = buildParams[key].trim();
      }
  }
  
  var re = new RegExp("\\s", "g");
	if (buildParams["plugin-slug"]) {
    // TODO: validate that plugin-slug should not contain invalid chars
  } else {
    // auto generated plugin-slug should be a valid file-system name
    buildParams["plugin-slug"] = buildParams["plugin-name"].toLowerCase().replace(re, "-");
  }
  
	if (buildParams["plugin-class-name"]) {
    // TODO: validate that className is valid identifier
  } else {
    // auto generated plugin-class-name should be a valid identifier
    buildParams["plugin-class-name"] = makeValidIdentifier(buildParams["plugin-name"].replace(re, "_"));
  }
  buildParams["plugin-class-name-upper"] = buildParams["plugin-class-name"].toUpperCase();
  
  copyValueIfMissing(buildParams, "plugin-desc", "plugin-name");
  copyValueIfMissing(buildParams, "owner-name", "author-name");
  copyValueIfMissing(buildParams, "owner-email", "author-email");
  copyValueIfMissing(buildParams, "owner-uri", "author-uri");

	var pkg = grunt.file.readJSON("package.json"),
      distdir = "dist/" + buildParams["plugin-slug"] + "/", // The path to package directory
      replacements = [];
  
  for(key in buildParams) {
      if(buildParams.hasOwnProperty(key)) {
          replacements.push({
              pattern: new RegExp("\{" + key + "\}", "g"),
              replacement: buildParams[key]
            });
      }
  }
  

	// Project configuration.
	var phpSourceFiles = ["**/*.php"];
  var cfg = {

	clean: ["dist/"],
  
  "string-replace": {
	  prod: {
      options: {
        replacements: replacements
      },

      files: [
        // Note that .php files are copied as .php.js. This is to hack preprocess to think .php.js file as js files
        {expand: true, cwd: "src/plugin-template", src : phpSourceFiles,  dest: distdir, ext: ".php.js" },
        {expand: true, cwd: "src/plugin-template", src : ["**/*.*", "!**/*.php"],  dest: distdir },
        {expand: true, cwd: "src/grunt-includes", src : ["**/*.*"],  dest: "dist/temp" }
        ]
    },
	},
  

	fileregexrename: {
	  prod: {
      options: {
        replacements: replacements
      },
      files: [ { expand: true, cwd: distdir, src: "**/*.*", dest: distdir }]

	  },
	  
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
        inline: true,
      },
      src : [ 'dist/**/*.php.js'] 
    }
    
  }
  
	};
  
  var preprocessContext = cfg.preprocess.options.context;
  
  for(var prop in buildParams.options) {
    var opt = buildParams.options[prop];
    if ((typeof opt == "boolean" && opt) || (typeof opt == "Array" && opt.length > 0)) {
      
      var key = prop.toUpperCase().replace(/-/g, "");
      preprocessContext[key] = opt;
      grunt.log.writeln(key + ": " + opt);
    }
  }
  
  if (buildParams.options["settings-page"] !== true) {
    phpSourceFiles.push("!**inc/admin-settings.php");
  }

  grunt.initConfig(cfg);

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks("grunt-string-replace");
  grunt.loadNpmTasks("grunt-file-regex-rename");
  
  grunt.registerTask("perform-final-tasks", "Copies empty index.php file to every folder", function() {
    
    // Force task into async mode and grab a handle to the "done" function.
    var done = this.async();

    var fs = require('fs'),
        copyHelper  = require("./grunt-modules/copyhelper");
    
    copyHelper.walk(distdir, function(error, found) {

      if (error) {
          grunt.fail.fatal(error);
          done();
          return;
      }

      found.dirs.forEach(function(item){
        grunt.file.copy("src/grunt-includes/index.php",  path.resolve(path.join(item, "index.php")));
      });

      found.files.forEach(function(item){
        // if the file extension is .php.js, change it to .php
        if(item.substr(item.length-7) == ".php.js") {
          fs.renameSync(item, item.substr(0, item.length-3));
        }
      });


      
      done();

    });

    
  });

	// Default task(s).
	grunt.registerTask("default", ["clean", "string-replace",  "fileregexrename", "preprocess", "perform-final-tasks"]);
};