"use strict;"

exports.makeReplacementObject = function (key, value) {
  return {
      pattern: new RegExp("\{" + key + "\}", "g"),
      replacement: value
    }
};


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