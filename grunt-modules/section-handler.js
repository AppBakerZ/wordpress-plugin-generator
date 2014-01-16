"use strict;"

var namingHelper = require("./naming-helper.js"),
    taskUtils    = require("./task-utils.js");


exports.generate = function(grunt, section, buildParams, replacements, distdirRoot) {

  var pluginSlug = buildParams["plugin-slug"],
      meta = section["pluginGeneratorMeta"],
      sectionTitle = meta.title,
      sectionIndex = meta.index;


  grunt.log.debug("section: " + sectionTitle);

  var settingFiles = [],
      taskNameList = [],
      stringReplaceTask = {};

  var sectionId = namingHelper.makeWpId(sectionTitle),
      sectionMethod = namingHelper.makeWpFunctionName(sectionTitle);

  if (sectionMethod.substr(sectionMethod.length-7) == "section") {
    sectionMethod = sectionMethod.substr(0, sectionMethod.length-8);
  }

  // we need new replacement object for every setting
  var sectionReplacements = replacements.map(function(item) { return item; } );
  sectionReplacements.push(taskUtils.makeReplacementObject("section-title", sectionTitle));
  sectionReplacements.push(taskUtils.makeReplacementObject("section-id", sectionId));
  sectionReplacements.push(taskUtils.makeReplacementObject("section-function", sectionMethod));
  sectionReplacements.push(taskUtils.makeReplacementObject("section-index", sectionIndex++));

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
  taskNameList.push("string-replace:" + taskId);

  // generate file for section callback function
  taskId = taskId + "-function";
  filename = distdirRoot + "temp2/" + taskId + ".txt";
  files[filename] = "src/grunt-includes/setting-section-function.txt";


  // Each property of a section is setting
  for (var settingProp in section) {
    if ("pluginGeneratorMeta" == settingProp) {
      // ignore property named pluginGeneratorMeta as it is not a setting
      continue;
    }

    grunt.log.debug("setting: " + settingProp);

    var setting = section[settingProp];
        settingName = settingProp;

    // we need new replacement object for every setting
    var settingReplacements = sectionReplacements.map(function(item) { return item; } );

    var settingResult = taskUtils.processSingleField(settingName, setting, settingReplacements, pluginSlug);


    taskId = sectionId + "-" + settingResult.settingId;
    filename = distdirRoot + "temp2/" + taskId + ".txt";

    files = {};
    files[filename] = "src/grunt-includes/setting-" + settingResult.settingFilenameSlug + "-field.txt";


    stringReplaceTask[taskId] = {
      options: {
        replacements: settingReplacements
      },
      files: files
    };
    settingFiles.push(filename);

    // add string-replace task in default task list for this section
    taskNameList.push("string-replace:" + taskId);
  } // end-for settingProp


  return {
    "string-replace": stringReplaceTask,
    taskNameList: taskNameList,
    settingFiles: settingFiles
  };

};
