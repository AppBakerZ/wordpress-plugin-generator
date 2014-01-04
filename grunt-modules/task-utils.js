"use strict;"

exports.makeReplacementObject = function (key, value) {
  return {
      pattern: new RegExp("\{" + key + "\}", "g"),
      replacement: value
    }
};
