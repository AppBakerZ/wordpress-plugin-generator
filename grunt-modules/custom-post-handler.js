"use strict;"

var namingHelper = require("./naming-helper.js"),
    taskUtils    = require("./task-utils.js");

const WORKING_FOLDER_NAME = "custom-posts";


exports.generate = function(grunt, post, buildParams, replacements, distdir) {

  grunt.log.debug("post: " + post.name);

  var settingFiles = [],
      taskNameList = [],
      stringReplaceTask = {},
      fileRenameTask = {};

  var postSlug = post.slug || namingHelper.makeWpId(post.name);

  var postClassName = post["class-name"];
  if (postClassName) {
    // TODO make sure that post class name is valid
  }
  else {
    postClassName = namingHelper.makeValidClassName(postSlug);
  }


  /*
  if (sectionMethod.substr(sectionMethod.length-7) == "section") {
    sectionMethod = sectionMethod.substr(0, sectionMethod.length-8);
  }
  */

  // we need new replacement object for every setting
  var postReplacements = replacements.map(function(item) { return item; } );
  postReplacements.push(taskUtils.makeReplacementObject("custom-post-class-name", postClassName));
  postReplacements.push(taskUtils.makeReplacementObject("custom-post-slug", postSlug));
  postReplacements.push(taskUtils.makeReplacementObject("custom-post-name", post.name));
  postReplacements.push(taskUtils.makeReplacementObject("custom-post-name-singular", post.nameSingular));

  var taskId = postSlug;

  // add a new string-replace task for this custom post
  stringReplaceTask[postSlug] = {
    options: {
      replacements: postReplacements
    },
    files: [
      {expand: true, cwd: "src/plugin-template", src : ["**/custom-post-*.php"],  dest: distdir, ext: ".php.js" },
      {expand: true, cwd: "src/plugin-template", src : ["**/custom-post-*.css"],  dest: distdir, ext: ".css.js" }
      //,{expand: true, cwd: "src/plugin-template", src : ["**/*{plugin-widget*.*", "!**/*.php", "!**/*.css"],  dest: distdir }
    ]
  };
  taskNameList.push("string-replace:" + taskId);

  // add a new fileregexrename task for this widget
  fileRenameTask[postSlug] = {
    options: {
      replacements: postReplacements
    },
    files: [ { expand: true, cwd: distdir, src: "**/custom-post-*.*", dest: distdir }]
  }
  taskNameList.push("fileregexrename:" + taskId);



  return {
    taskNameList: taskNameList,
    "string-replace": stringReplaceTask,
    "fileregexrename": fileRenameTask,
    settingFiles: settingFiles
  };

};
