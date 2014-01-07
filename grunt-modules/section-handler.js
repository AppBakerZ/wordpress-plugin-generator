"use strict;"

var namingHelper = require("./naming-helper.js"),
    taskUtils    = require("./task-utils.js");


exports.generate = function(grunt, section, buildParams, replacements, distdirRoot) {

  var meta = section["pluginGeneratorMeta"],
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
        settingName = settingProp,
        settingId = namingHelper.makeWpId(settingName);

    // supported setting types are text, number, checkbox, select, radio
    var settingType = "text",
        settingCallbackFunction = "render_input_field",
        settingHelpText = "Help text for " + settingName, 
        settingFilenameSlug = "input",
        typeOfSetting = typeof(setting),
        settingOptions = {};

    if (typeOfSetting == "string") {
      if (setting.length > 0) {
        settingType = setting;
      }
    }
    else if (typeOfSetting == "object") {
      settingType = setting["type"];

      if (setting.hasOwnProperty("options")) {
        settingOptions = setting.options;  
      }

      if (setting.hasOwnProperty("helptext")) {
        settingHelpText = setting.helptext;  
      }
    }

    switch (settingType) {
      case "select":
        settingCallbackFunction = "render_select_field";
        settingFilenameSlug = "select";
        break;

      case "checkbox":
        settingCallbackFunction = "render_checkbox_field";
        settingFilenameSlug = "checkbox";
        break;

      case "radio":
        settingCallbackFunction = "render_radio_field";
        settingFilenameSlug = "radio";
        break;

      default:
        // be default we have initilized values for a text field
        break;
    }

    var settingOptionsText = "",
        settingOptionsCount = Object.keys(settingOptions).length;
    if (settingOptionsCount > 0) {
      settingOptionsText += "\r\n";
      for (var optName in settingOptions) {
        settingOptionsText += "                              " 
                           + optName + ' => "' + settingOptions[optName] + '"'
                           + (--settingOptionsCount > 0? ",": "")
                           + "\r\n";
      }            
      settingOptionsText += "                              " 
    }


    // we need new replacement object for every setting
    var settingReplacements = sectionReplacements.map(function(item) { return item; } );
    settingReplacements.push(taskUtils.makeReplacementObject("setting-name", settingName));
    settingReplacements.push(taskUtils.makeReplacementObject("setting-id", settingId));
    settingReplacements.push(taskUtils.makeReplacementObject("setting-type", settingType));
    settingReplacements.push(taskUtils.makeReplacementObject("setting-help-text", settingHelpText));
    settingReplacements.push(taskUtils.makeReplacementObject("setting-select-options", settingOptionsText));

    taskId = sectionId + "-" + settingId;
    filename = distdirRoot + "temp2/" + taskId + ".txt";

    files = {};
    files[filename] = "src/grunt-includes/setting-" + settingFilenameSlug + "-field.txt";


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
