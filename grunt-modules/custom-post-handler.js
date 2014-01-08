"use strict;"

var namingHelper = require("./naming-helper.js"),
    taskUtils    = require("./task-utils.js"),
    fs    = require("fs");

const WORKING_FOLDER_NAME = "custom-posts";


exports.generate = function(grunt, post, buildParams, replacements, distdir, tempdir) {

  grunt.log.debug("post: " + post.name);

  var settingFiles = [],
      taskNameList = [],
      stringReplaceTask = {},
      fileRenameTask = {},
      concatTask = {};

  var postSlug = post.slug || namingHelper.makeWpId(post.name);

  var postClassName = post["class-name"];
  if (postClassName) {
    // TODO make sure that post class name is valid
  }
  else {
    postClassName = namingHelper.makeValidClassName(postSlug);
  }

  var postSingularName = post["nameSingular"];
  if (postSingularName) {
    // TODO make sure that post class name is valid
  }
  else {
    if (post.name[post.name.length-1] == "s") {
      postSingularName = post.name.substr(0, post.name.length-1);
    }
    else {
      postSingularName = post.name;
    }    
  }


  // we need new replacement object for every setting
  var postReplacements = replacements.map(function(item) { return item; } );
  postReplacements.push(taskUtils.makeReplacementObject("custom-post-class-name", postClassName));
  postReplacements.push(taskUtils.makeReplacementObject("custom-post-slug", postSlug));
  postReplacements.push(taskUtils.makeReplacementObject("custom-post-name", post.name));
  postReplacements.push(taskUtils.makeReplacementObject("custom-post-name-singular", postSingularName));

  var taskId = "";
  var metaBoxes = [];

  for (var metaboxProp in post.metaboxes) {
    var mb = post.metaboxes[metaboxProp],
        mbId = namingHelper.makeWpId(metaboxProp),
        mbFuncName = namingHelper.makeWpFunctionName(metaboxProp),
        taskId = postSlug + "-metabox-" + mbId,
        filename = tempdir + WORKING_FOLDER_NAME + "/" + taskId + ".inc";

    var metaboxReplacements = postReplacements.map(function(item) { return item; } );
    metaboxReplacements.push(taskUtils.makeReplacementObject("meta-box-function-name", mbFuncName));

    // add a new fileregexrename task for this metabox to generate custom-post-meta-box
    var files = {};
    files[filename] = "src/grunt-includes/custom-post-meta-box.php";

    // Generate custom-post-meta-box.php for every metabox
    stringReplaceTask[taskId] = {
      options: {
        replacements: metaboxReplacements
      },
      files: files
    };

    taskNameList.push("string-replace:" + taskId);
    metaBoxes.push({
        name: metaboxProp,
        id: mbId,
        funcName: mbFuncName
      });

  }

  /*********************************************************************************************************
  * concat all {custom-post-slug}-metabox-{mbId}.inc files to a single file {custom-post-slug}-metaboxes.inc
  *********************************************************************************************************/
  taskId = postSlug + "-metabox";
  concatTask[taskId] = {
      src : [tempdir + WORKING_FOLDER_NAME + "/" + taskId + "-*.inc"],
      dest: tempdir + postSlug + "-metaboxes.inc"
    };
  taskNameList.push("concat:" + taskId);


  // add a new task to generate require snippet
  files = {};
  taskId = postSlug + "-require-custom-post";
  filename = tempdir + WORKING_FOLDER_NAME + "/" + taskId + ".inc";
  files[filename] = "src/grunt-includes/custom-post-require.php";

  // Generate custom-post-meta-box.php for every metabox
  stringReplaceTask[taskId] = {
    options: {
      replacements: postReplacements
    },
    files: files
  };
  taskNameList.push("string-replace:" + taskId);


  /*********************************************************************************************************
  * concat all {custom-post-slug}-metabox-{mbId}.inc files to a single file {custom-post-slug}-metaboxes.inc
  *********************************************************************************************************/
  taskId = postSlug + "-require-custom-post";
  concatTask[taskId] = {
      src : [tempdir + WORKING_FOLDER_NAME + "/*-require-custom-post.inc"],
      dest: tempdir + "custom-post-require.inc"
    };
  taskNameList.push("concat:" + taskId);



  /******************************************************************
  * tasks to generate php, css and js files for this custom post type
  *******************************************************************/
  taskId = postSlug;
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

  // add a new fileregexrename task for this custom post
  fileRenameTask[postSlug] = {
    options: {
      replacements: postReplacements
    },
    files: [ { expand: true, cwd: distdir, src: "**/custom-post-*.*", dest: distdir }]
  }
  taskNameList.push("fileregexrename:" + taskId);



  return {
    taskNameList: taskNameList,
    settingFiles: settingFiles,
    tasks: {
      "string-replace": stringReplaceTask,
      "fileregexrename": fileRenameTask,
      "concat": concatTask
    },
    metaBoxes: metaBoxes,
    postSlug: postSlug

  };

};
