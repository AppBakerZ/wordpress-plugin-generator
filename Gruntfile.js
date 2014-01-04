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

function makeReplacementObject(key, value) {
  return {
      pattern: new RegExp("\{" + key + "\}", "g"),
      replacement: value
    }
}

var namingHelper = require("./grunt-modules/naming-helper.js");

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
        "settings": {},
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

	if (buildParams["plugin-slug"]) {
    // TODO: validate that plugin-slug should not contain invalid chars
  } else {
    // auto generated plugin-slug should be a valid file-system name
    buildParams["plugin-slug"] = buildParams["plugin-name"].toLowerCase().replace(namingHelper.RE_WORD_BOUNDARY, "-");
  }

	if (buildParams["plugin-class-name"]) {
    // TODO: validate that className is valid identifier
  } else {
    // auto generated plugin-class-name should be a valid identifier
    buildParams["plugin-class-name"] = namingHelper.makeValidIdentifier(buildParams["plugin-name"].replace(namingHelper.RE_WORD_BOUNDARY, "_"));
  }
  buildParams["plugin-class-name-upper"] = buildParams["plugin-class-name"].toUpperCase();

  copyValueIfMissing(buildParams, "plugin-desc", "plugin-name", "Short Description");
  copyValueIfMissing(buildParams, "owner-name", "author-name");
  copyValueIfMissing(buildParams, "owner-email", "author-email");
  copyValueIfMissing(buildParams, "owner-uri", "author-uri");

	var distdirRoot = "dist/",
      tempdir = distdirRoot + "temp/",
      distdir = distdirRoot + buildParams["plugin-slug"] + "/", // The path to package directory
      replacements = [];

  for(key in buildParams) {
      if(buildParams.hasOwnProperty(key)) {
          replacements.push(makeReplacementObject(key, buildParams[key]));
      }
  }

  // don't copy widget/custom-post related files, these will be included in a separate files object
	var phpSourceFiles = ["**/*.php", "!**/*{plugin-widget*.*", "!**/*-custom-post.*"];

  // Grunt default task list
  var taskList = ["clean", "string-replace:prod",  "fileregexrename:prod"];
	// Grunt project configuration.
  var cfg = {

	clean: [tempdir, distdirRoot + "temp2/", distdirRoot + buildParams["plugin-slug"], "dist/"],

  concat: {
    "prod": {
      src : [distdirRoot + "temp2/*-function.txt"],
      dest: tempdir + 'sections-functions.inc'
    }
  },

  "string-replace": {
	  prod: {
      options: {
        replacements: replacements
      },

      files: [
        // Note that .php/.css files are copied as .php.js/.css.js. This is to hack preprocess to think .php.js file as js files
        {expand: true, cwd: "src/plugin-template", src : phpSourceFiles,  dest: distdir, ext: ".php.js" },
        {expand: true, cwd: "src/plugin-template", src : ["**/*.css", "!**/*plugin-widget*.css"],  dest: distdir, ext: ".css.js" },
        {expand: true, cwd: "src/plugin-template", src : ["**/*.*", "!**/*.css", "!**/*.php", "!**/*plugin-widget*.*", "!**/*-custom-post.*"],  dest: distdir },
        {expand: true, cwd: "src/grunt-includes", src : ["**/*.*"],  dest: tempdir }
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
      src : [ 'dist/**/*.php.js', 'dist/**/*.js', 'dist/**/*.css.js' ]
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

  var stringReplaceTask = cfg["string-replace"],
      fileRenameTask = cfg["fileregexrename"]

  var widgets = buildParams.options.widgets,
      widgetFiles = [];

  if (widgets.length > 0) {

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
        widget["class-name"] = namingHelper.makeValidClassName(widgetId);
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
          {expand: true, cwd: "src/plugin-template", src : ["**/*{plugin-widget*.css"],  dest: distdir, ext: ".css.js" },
          {expand: true, cwd: "src/plugin-template", src : ["**/*{plugin-widget*.*", "!**/*.php", "!**/*.css"],  dest: distdir }
        ]
      };

      // add a new fileregexrename task for this widget
      fileRenameTask[widget.id] = {
        options: {
          replacements: widgetReplacements
        },
        files: [ { expand: true, cwd: distdir, src: "**/*{plugin-widget*.*", dest: distdir }]
      }

      // add string-replace task in default task list for this widget
      taskList.push("string-replace:" + widget.id);
      // add fileregexrename task in default task list for this widget
      taskList.push("fileregexrename:" + widget.id);
      widgetFiles.push("class-" + widgetId + ".php");

    }); // end widgets.forEach

  }

  var settings = buildParams.settings,
      settingFiles = []
      sectionIds = [];


  if (settings && Object.keys(settings).length > 0) {
    // Set preprocessor context variable so it is available for grunt-preprocess @ifdef
    preprocessContext["SETTINGS"] = true;

    grunt.log.debug("found settings");
    // found atleast one property in setting object
    for (var pageProp in settings) {
      var page = settings[pageProp];
      // TODO: for now, we support only one page
      grunt.log.debug("page: " + pageProp);
      var sectionIndex = 0;

      for (var sectionProp in page) {
        // Each property of a page is a section
        grunt.log.debug("section: " + sectionProp);
        var section = page[sectionProp];
            sectionTitle = sectionProp,
            sectionId = namingHelper.makeWpId(sectionTitle),
            sectionMethod = namingHelper.makeWpFunctionName(sectionTitle);

        if (sectionMethod.substr(sectionMethod.length-7) == "section") {
          sectionMethod = sectionMethod.substr(0, sectionMethod.length-8);
        }

        // we need new replacement object for every setting
        var sectionReplacements = replacements.map(function(item) { return item; } );
        sectionReplacements.push(makeReplacementObject("section-title", sectionTitle));
        sectionReplacements.push(makeReplacementObject("section-id", sectionId));
        sectionReplacements.push(makeReplacementObject("section-function", sectionMethod));
        sectionReplacements.push(makeReplacementObject("section-index", sectionIndex++));

        // add a new string-replace task for this section
        var taskId = sectionId,
            filename = distdirRoot + "temp2/" + taskId + ".txt";

        // generate file for section code to be used inside handle_admin_init()
        var files = {};
        files[filename] = "src/grunt-includes/setting-section.txt";

        // Generate setting-section.txt for every section
        stringReplaceTask[taskId] = {
          options: {
            replacements: sectionReplacements
          },
          files: files
        };

        sectionIds.push(buildParams["plugin-slug"] + "-" + sectionId);
        settingFiles.push(filename);

        // add string-replace task in default task list for this section
        taskList.push("string-replace:" + taskId);

        // generate file for section callback function
        taskId = taskId + "-function";
        filename = distdirRoot + "temp2/" + taskId + ".txt";
        files[filename] = "src/grunt-includes/setting-section-function.txt";


        for (var settingProp in section) {
          grunt.log.debug("setting: " + settingProp);
          // Each property of a section is setting
          var setting = section[settingProp];
              settingName = settingProp,
              settingId = namingHelper.makeWpId(settingName);

          // we need new replacement object for every setting
          var settingReplacements = sectionReplacements.map(function(item) { return item; } );
          settingReplacements.push(makeReplacementObject("setting-name", settingName));
          settingReplacements.push(makeReplacementObject("setting-id", settingId));

          var settingType = "",
              settingCallbackFunction = "render_input_field";
          if (typeof(setting) == "string") {
            settingType = (setting.length > 0) ? setting : "text";
          }
          else if (typeof(setting) == "object") {
            settingType = setting["type"];
            
            


          }


          settingReplacements.push(makeReplacementObject("setting-type", settingType));

          taskId = sectionId + "-" + settingId;
          filename = distdirRoot + "temp2/" + taskId + ".txt";

          files = {};
          files[filename] = "src/grunt-includes/setting-field.txt";


          stringReplaceTask[taskId] = {
            options: {
              replacements: settingReplacements
            },
            files: files
          };
          settingFiles.push(filename);

          // add string-replace task in default task list for this section
          taskList.push("string-replace:" + taskId);
        }


      }

    }
  }


  grunt.initConfig(cfg);

	grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-concat");
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

    fs.writeFileSync(tempdir + "widgets.php", contents.join("\r\n"));

  });
  // The preprocess plugin requires that every include file must be present even if the include is
  // dynamic and inside a falsy @ifdef block.
  // We need to add the task to default task list so that widgets.php is always generated.
  taskList.push("generate-widget-include-file");


  grunt.registerTask("generate-settings-include-file", "Generates temp2/handle_admin_init.txt to be included in plugin file", function() {
    var fs = require("fs");

    var spaces = "    ",
    spaces4 = spaces + spaces + spaces + spaces;

    var codeLines = [
                      spaces + "// Make " + sectionIds.length + " Sections",
                      spaces + "$sections = array(",
                      spaces4 + '"' + sectionIds.join('",\r\n' + spaces4 + '"') + '"' ,
                      spaces + spaces + ");",
                      "\r\n"
                    ];

    var contents = [];

    if (settingFiles.length) {
      contents = settingFiles.map(function(item){
          return fs.readFileSync(item);
        });
    }

    fs.writeFileSync(tempdir + "handle_admin_init.txt", codeLines.join("\r\n") + contents.join("\r\n"));

  });
 taskList.push("generate-settings-include-file");


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
        // if the file extension is .php.js or .css.js, remove the trailing .js
        var trail = item.substr(item.length-7);

        if(trail == ".php.js"
          || trail == ".css.js"
          ) {
          fs.renameSync(item, item.substr(0, item.length-3));
        }
      });



      done();

    });


  });

	// Default task(s).
  taskList.push("concat");
  taskList.push("preprocess");
  taskList.push("perform-final-tasks");

	grunt.registerTask("default", taskList);
};