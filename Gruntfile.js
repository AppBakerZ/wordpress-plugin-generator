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

var namingHelper = require("./grunt-modules/naming-helper.js"),
    taskUtils    = require("./grunt-modules/task-utils.js"),
    customPostHandler = require("./grunt-modules/custom-post-handler.js");

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
        "custom-posts": [],
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
      finalIncludesDir = tempdir + "final-includes/",
      distdir = distdirRoot + buildParams["plugin-slug"] + "/", // The path to package directory
      replacements = [];

  for(key in buildParams) {
      if(buildParams.hasOwnProperty(key)) {
          replacements.push(taskUtils.makeReplacementObject(key, buildParams[key]));
      }
  }

  // don't copy widget/custom-post related files, these will be included in a separate files object
	var phpSourceFiles = ["**/*.php", "!**/*{plugin-widget*.*", "!**/custom-post-*.*"];

  // Grunt default task list
  var taskList = ["clean", "string-replace:prod",  "fileregexrename:prod"];
	// Grunt project configuration.
  var cfg = {

  array2file: {},

	clean: [tempdir, distdirRoot + "temp2/", distdirRoot + buildParams["plugin-slug"], "dist/"],

  concat: {
    "merge-section-functions": {
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
        {expand: true, cwd: "src/plugin-template", src : ["**/*.css", "!**/*plugin-widget*.css","!**/*custom-post*.css"],  dest: distdir, ext: ".css.js" },
        {expand: true, cwd: "src/plugin-template", src : ["**/*.*", "!**/*.css", "!**/*.php", "!**/*plugin-widget*.*", "!**/*custom-post*.*"],  dest: distdir },
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

  },

  "generate-widget-include-file": {
    prod : {
      files: [ { src: [] , dest: tempdir + "widgets.php" }]
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

    var widgetHandler = require("./grunt-modules/widget-handler.js");

    // Set preprocessor context variable so it is available for grunt-preprocess @ifdef
    preprocessContext["WIDGETS"] = true;

    widgets.forEach(function(widget) {

      grunt.log.debug("widgets.forEach: " + widget );

      // Valid that one of widget-id and widget-class-name are present
      if (!widget.id) {
        grunt.log.fail("You should provide id for every widget.");
        return;
      }

      var widgetResults = widgetHandler.generate(grunt, widget, buildParams, replacements, distdir);

      // add a new string-replace task for this widget
      stringReplaceTask[widget.id] = widgetResults["string-replace"];

      // add a new fileregexrename task for this widget
      fileRenameTask[widget.id] = widgetResults["fileregexrename"];

      // add string-replace task in default task list for this widget
      taskList.push("string-replace:" + widget.id);
      // add fileregexrename task in default task list for this widget
      taskList.push("fileregexrename:" + widget.id);
      widgetFiles.push("class-" + widgetResults.widgetId + ".php");

    }); // end widgets.forEach

    cfg["generate-widget-include-file"].prod.files[0].src = widgetFiles;

  }

  // The preprocess plugin requires that every include file must be present even if the include is
  // dynamic and inside a falsy @ifdef block.
  // We need to add the task to default task list even when no widget so that widgets.php is always generated.
  taskList.push("generate-widget-include-file");

  var settings = buildParams.settings,
      settingFiles = []
      sectionIds = [];


  if (settings && Object.keys(settings).length > 0) {
    // Set preprocessor context variable so it is available for grunt-preprocess @ifdef
    preprocessContext["SETTINGS"] = true;

    // found atleast one property in setting object
    grunt.log.debug("found settings");

    var sectionHandler = require("./grunt-modules/section-handler.js");

    for (var pageProp in settings) {
      var page = settings[pageProp];
      // TODO: for now, we support only one page
      grunt.log.debug("page: " + pageProp);
      var sectionIndex = 0;

      for (var sectionProp in page) {
        // Each property of a page is a section
        var section = page[sectionProp];

        section["pluginGeneratorMeta"] =  {
          title: sectionProp,
          index: sectionIndex++
        };            

        var sectionResult = sectionHandler.generate(grunt, section, buildParams, replacements, distdirRoot);
        var sectionStringReplaceTasks = sectionResult["string-replace"];

        grunt.log.debug("Adding tasks...");
        sectionResult.taskNameList.forEach(function(qualifiedTaskName) {
            grunt.log.debug(qualifiedTaskName);

            var taskNameParts = qualifiedTaskName.split(":"),
                taskPlugin = taskNameParts[0].trim(),
                taskName = taskNameParts[1].trim();

            if (taskPlugin == "string-replace") {
              stringReplaceTask[taskName] = sectionStringReplaceTasks[taskName];
              taskList.push(qualifiedTaskName);
            }

          });

        grunt.log.debug("Adding files...");
        sectionResult.settingFiles.forEach(function(item) {
            grunt.log.debug(item);
            settingFiles.push(item);
          });


      } // end-for sectionProp

    } // end-for pageProp
  }


  var customPosts = buildParams["custom-posts"],
      customPostMetaBoxes = {};


  if (customPosts && Object.keys(customPosts).length > 0) {
    // Set preprocessor context variable so it is available for grunt-preprocess @ifdef
    preprocessContext["CUSTOMPOSTS"] = true;

    // found atleast one property in custom posts object
    grunt.log.debug("found custom posts");


    customPosts.forEach(function(customPost) {
        grunt.log.debug("custom post: " + customPost.name);

        var customPostResult = customPostHandler.generate(grunt, customPost, buildParams, replacements, distdir, tempdir);

        grunt.log.debug("Adding tasks...");
        taskUtils.populateCfgTasks( customPostResult.taskNameList,
                                    cfg,
                                    customPostResult.tasks,
                                    taskList,
                                    grunt
                                  )

        customPostMetaBoxes[ customPostResult.postSlug ] = customPostResult.metaBoxes;

      }); // end customPosts.forEach

  } //end if customPosts
  /*********************************************************************************************************
  * concat all {custom-post-slug}-require-custom-post.inc files to a single file custom-post-require.inc
  *********************************************************************************************************/
  // We need to generate custom-post-require.inc anyway because preprocess will keep throwing error if 
  // the file does not exusts although its include tag is inside @ifdef
  cfg.concat["merge-require-custom-post"] = {
      src : [tempdir + customPostHandler.WORKING_FOLDER_NAME + "/*-require-custom-post.inc"],
      dest: finalIncludesDir + "custom-post-require.inc"
    };
  taskList.push("concat:merge-require-custom-post");

  grunt.initConfig(cfg);

	grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks("grunt-string-replace");
  grunt.loadNpmTasks("grunt-file-regex-rename");

  grunt.loadTasks("./grunt-modules/tasks/");

  grunt.registerTask("generate-include-files", "Generates temp2/handle_admin_init.txt and handle-add-meta-boxes.inc to be included in plugin file", function() {
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


    // generate the include file {custom-post-slug}-handle-add-meta-boxes.inc for custom post
    for (var postSlug in customPostMetaBoxes) {
      var metaBoxes = customPostMetaBoxes[postSlug];

      fs.writeFileSync( tempdir + postSlug + "-handle-add-meta-boxes.inc",
                        metaBoxes.map(function(mb){
                            return "    $this->add_meta_box('"
                                    + mb.id
                                    + "', __('"+ mb.name +"', '{plugin-slug}'), "
                                    + "'render_" + mb.funcName + "_metabox');";
                          }).join("\r\n")
                      );

    }    
  });
  taskList.push("generate-include-files");


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
  taskList.push("concat:merge-section-functions");
  taskList.push("preprocess");
  taskList.push("perform-final-tasks");

	grunt.registerTask("default", taskList);
};