"use strict;"

var namingHelper = require("./naming-helper.js");


function makeReplacementObject (key, value) {
  return {
      pattern: new RegExp("\{" + key + "\}", "g"),
      replacement: value
    }
};

exports.makeReplacementObject = makeReplacementObject;


exports.populateCfgTasks = function(taskNameList, cfgTasks, customTasks, taskList, grunt) {

  for (var i=0 ; i< taskNameList.length ; i++) {
    var qualifiedTaskName = taskNameList[i];

    var taskNameParts = qualifiedTaskName.split(":"),
        taskPlugin = taskNameParts[0].trim(),
        taskName = taskNameParts[1].trim();

    var cfgTask = cfgTasks[taskPlugin],
        customTask = customTasks[taskPlugin];


    if (!cfgTask || !customTask) continue;

    grunt.log.debug("Adding " + taskName + " " + customTask[taskName]);

    cfgTask[taskName] = customTask[taskName];
    taskList.push(qualifiedTaskName);

  }


};

exports.processSingleField = function(settingName, setting, settingReplacements, pluginSlug) {

    var settingId = namingHelper.makeWpId(settingName);

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
                           + "'" + optName + "'" + " => __('" + settingOptions[optName] + "', '" + pluginSlug + "')"
                           + (--settingOptionsCount > 0? ",": "")
                           + "\r\n";
      }            
      settingOptionsText += "                              " 
    }


    settingReplacements.push(makeReplacementObject("setting-name", settingName));
    settingReplacements.push(makeReplacementObject("setting-id", settingId));
    settingReplacements.push(makeReplacementObject("setting-type", settingType));
    settingReplacements.push(makeReplacementObject("setting-help-text", settingHelpText));
    settingReplacements.push(makeReplacementObject("setting-select-options", settingOptionsText));

    return {
      settingId: settingId,
      settingFilenameSlug: settingFilenameSlug
    };

};

/*
exports.g = function (files, destFile, preLines, postLines) {
  var fs = require("fs");

  var preLines = preLines || [],
      postLines = postLines || [],

      contents = (files.map(function(item){
          return fs.readFileSync(item);
        }) || []);

  fs.writeFileSync(destFile, preLines.join("\r\n") + contents.join("\r\n"), postLines.join("\r\n"));

}
*/