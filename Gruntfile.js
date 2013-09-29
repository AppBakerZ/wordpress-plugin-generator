"use strict;"
/**************************************************************
* Author:    Kashif Iqbal Khan
* Email:     kashiif@gmail.com
* Copyright: 2013 AppBakerZ (appbakerz.com)
***************************************************************/

function extend(defaults, override){
    for(var key in override) {
        if(override.hasOwnProperty(key)) {
            var val = override[key];
            if (val instanceof Array) {
              var arr = new Array(val.length);
              for (var i=0 ; i<val.length; i++) {
                arr[i] = val[i];
              }
              defaults[key] = arr;
            }
            else if (typeof val == "object") {
              var target = defaults[key];
              if (!target) {
                target = {};
                defaults[key] = target;
              }
              extend(target, val);
            }
            else {
              defaults[key] = val;
            }
        }
    }
    return defaults;
}

function copyValueIfMissing(obj, key1, key2, extra){ 
  if (!obj.hasOwnProperty(key1) || obj[key1].length == 0) {
    obj[key1] = obj[key2] + (extra? " " + extra: "");
  }
}

function isValidIdentifier(name) {
  return true;
}

function makeValidIdentifier(name) {
  return name.trim().replace(/\W+/g, "");
}

/**
* Converts the given String into a valid Class name
*/
function makeValidClassName(theString) {
  var name = theString.replace(/[^a-z|A-Z|\-|_|\s|0-9]/g, "");
  name = name.split(/[-|_|\s]/g);
  for (var w=0 ; w<name.length; w++) {
    var word = name[w];
    if (word.length > 1) {
      name[w] = (word[0].toUpperCase()) + word.substr(1);
    }
    else {
      name[w] = word.toUpperCase();
    }
  }
  return name.join("");
}

function makeReplacementObject(key, value) {
  return {
      pattern: new RegExp("\{" + key + "\}", "g"),
      replacement: value
    }
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
          "settings-page": true,
          "widgets": []
        },
      };
  
  // Valid that user has provided values for required parameters in build.json
  var missing = ["plugin-name", "author-name", "author-email"].filter(function(item) {
      var v = userParams[item]; 
      return (!v || v.trim().length == 0);
    });
    
  if (missing.length) {
    grunt.fail.fatal("Not found valid values for: " + missing);
    return;
  }  

  // Use default values for parameters not in build.json
  extend(buildParams, userParams);
  for(var key in buildParams) {
      if(buildParams.hasOwnProperty(key)) {
        var val = buildParams[key]
        if (typeof val == "string") {
          buildParams[key] = buildParams[key].trim();
        }
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
  
  copyValueIfMissing(buildParams, "plugin-desc", "plugin-name", "Short Description");
  copyValueIfMissing(buildParams, "owner-name", "author-name");
  copyValueIfMissing(buildParams, "owner-email", "author-email");
  copyValueIfMissing(buildParams, "owner-uri", "author-uri");

	var distdirRoot = "dist/",
      distdir = distdirRoot + buildParams["plugin-slug"] + "/", // The path to package directory
      replacements = [];
  
  for(key in buildParams) {
      if(buildParams.hasOwnProperty(key)) {
          replacements.push(makeReplacementObject(key, buildParams[key]));
      }
  } 

	var phpSourceFiles = ["**/*.php"];
  // Grunt default task list
  var taskList = ["clean", "string-replace:prod",  "fileregexrename:prod"];
	// Grunt project configuration.
  var cfg = {

	clean: ["dist/", distdirRoot + "temp/"],
  
  "string-replace": {
	  prod: {
      options: {
        replacements: replacements
      },

      files: [
        // Note that .php files are copied as .php.js. This is to hack preprocess to think .php.js file as js files
        {expand: true, cwd: "src/plugin-template", src : phpSourceFiles,  dest: distdir, ext: ".php.js" },
        {expand: true, cwd: "src/plugin-template", src : ["**/*.*", "!**/*.php", "!**/*plugin-widget*.*"],  dest: distdir },
        {expand: true, cwd: "src/grunt-includes", src : ["**/*.*"],  dest: distdirRoot + "temp" }
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
    }
  }
  
  if (buildParams.options["settings-page"] !== true) {
    phpSourceFiles.push("!**inc/admin-settings.php");
  }
  
  // don't copy widget related files, these will be included in a separate files object
  phpSourceFiles.push( "!**/*{plugin-widget*.*" );

  var widgets = buildParams.options.widgets,
      widgetFiles = [];
  
  if (widgets.length > 0) {

    var stringReplaceTask = cfg["string-replace"],
        fileRenameTask = cfg["fileregexrename"]

    // Set preprocessor context variable so it is available for grunt-preprocess @ifdef
    preprocessContext["WIDGETS"] = true;

    widgets.forEach(function(widget, arg2, arg3) {
    
      grunt.log.debug("widgets.forEach: " + widget + ", " + arg2 + ", " + arg3);

      // Valid that one of widget-id and widget-class-name are present
      if (!widget.id) {
        grunt.log.fail("You should provide id for every widget.");
        return;
      }
      
      var widgetId = widget.id;
      // if widget id does not ends with "widget", make it so
      if (widgetId.length < 6) {
        widgetId += "widget";
      }
      else {
        if (widgetId.substr(widgetId.length-6).toLowerCase() != "widget") { // NodeJS does not have String.endsWith()
          widgetId += "-widget";
        }
      }
      
      if (widget["class-name"]) {
        // TODO make sure widget class name is valid
      }
      else {
        widget["class-name"] = makeValidClassName(widgetId);
      }

      // TODO: make sure widget-id and widget class name are unique
      
      // we need new replacement object for every widget
      var widgetReplacements = replacements.map(function(item) { return item; } );

      widgetReplacements.push(makeReplacementObject("plugin-widget-name", buildParams["plugin-name"] + " Widget"));
      widgetReplacements.push(makeReplacementObject("plugin-widget-class-name", widget["class-name"]));
      widgetReplacements.push(makeReplacementObject("plugin-widget-id", widgetId));

      grunt.log.debug("replacements: " + JSON.stringify(widgetReplacements));
      
      
      // add a new string-replace task for this widget
      stringReplaceTask[widget.id] = {
        options: {
          replacements: widgetReplacements
        },
        files: [
          {expand: true, cwd: "src/plugin-template", src : ["**/*{plugin-widget*.php"],  dest: distdir, ext: ".php.js" },
          {expand: true, cwd: "src/plugin-template", src : ["**/*{plugin-widget*.*", "!**/*.php"],  dest: distdir }
        ]
      }; 
      
      // add a new fileregexrename task for this widget
      fileRenameTask[widget.id] = {
        options: {
          replacements: widgetReplacements
        },
        files: [ { expand: true, cwd: distdir, src: "**/*{plugin-widget*.*", dest: distdir }]
      }
      
      // add string-replace task in default taks list for this widget
      taskList.push("string-replace:" + widget.id);
      // add fileregexrename task in default taks list for this widget
      taskList.push("fileregexrename:" + widget.id);
      widgetFiles.push("class-" + widgetId + ".php");
      
    }); // end widgets.forEach
    
  }
    
  grunt.initConfig(cfg);

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks("grunt-string-replace");
  grunt.loadNpmTasks("grunt-file-regex-rename");
  
  grunt.registerTask("generate-widget-include-file", "Generates temp/widgets.php to be included in plugin file", function() {
    var fs = require("fs");

    var contents = [];

    if (widgetFiles.length) {
      var l = "require( plugin_dir_path( __FILE__ ) . 'inc/admin-settings.php' );"

      
      var contents = widgetFiles.map(function(item){
          return "require( plugin_dir_path( __FILE__ ) . 'inc/" + item + "' );"
        });    
    }
    
    fs.writeFileSync(distdirRoot + "temp/widgets.php", contents.join("\r\n"));
    
  });
  // The preprocess plugin requires that every include file must be present even if the include is
  // dynamic and inside a falsy @ifdef block. 
  // We need to add the task to default task list so that widgets.php is always generated.
  taskList.push("generate-widget-include-file");

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
  taskList.push("preprocess");  
  taskList.push("perform-final-tasks");
  
	grunt.registerTask("default", taskList);
};