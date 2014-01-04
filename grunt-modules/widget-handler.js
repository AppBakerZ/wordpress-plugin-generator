"use strict;"

var namingHelper = require("./naming-helper.js"),
    taskUtils    = require("./task-utils.js");


exports.generate = function(grunt, widget, buildParams, replacements, distdir) {

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

  widgetReplacements.push(taskUtils.makeReplacementObject("plugin-widget-name", buildParams["plugin-name"] + " Widget"));
  widgetReplacements.push(taskUtils.makeReplacementObject("plugin-widget-class-name", widget["class-name"]));
  widgetReplacements.push(taskUtils.makeReplacementObject("plugin-widget-id", widgetId));

  grunt.log.debug("replacements: " + JSON.stringify(widgetReplacements));


  // add a new string-replace task for this widget
  var stringReplaceTask = {
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
  var fileRenameTask = {
    options: {
      replacements: widgetReplacements
    },
    files: [ { expand: true, cwd: distdir, src: "**/*{plugin-widget*.*", dest: distdir }]
  }

  return {
    widgetId: widgetId,
    "string-replace": stringReplaceTask,
    "fileregexrename": fileRenameTask 
  };

};
