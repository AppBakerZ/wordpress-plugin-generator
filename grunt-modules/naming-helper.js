"use strict;"

var fs  = require('fs'),
    path = require('path');


function isValidIdentifier(name) {
  return true;
}

function makeValidIdentifier(name) {
  return name.trim().replace(/\W+/g, "");
}

/**
* Converts the given String into a valid Class name
*/
function makeValidClassName(theString) {
  var name = theString.replace(/[^a-z|A-Z|\-|_|\s|0-9]/g, "");
  name = name.split(/[-|_|\s]/g);
  for (var w=0 ; w<name.length; w++) {
    var word = name[w];
    if (word.length > 1) {
      name[w] = (word[0].toUpperCase()) + word.substr(1);
    }
    else {
      name[w] = word.toUpperCase();
    }
  }
  return name.join("");
}

var RE_WORD_BOUNDARY = new RegExp("\\s", "g");
function makeWpId(str) {
  return str.toString().toLowerCase().replace(RE_WORD_BOUNDARY, "-");
}

function makeWpFunctionName(str) {
  return str.toString().toLowerCase().replace(RE_WORD_BOUNDARY, "_");
}

exports.isValidIdentifier   = isValidIdentifier;
exports.makeValidIdentifier = makeValidIdentifier;
exports.makeValidClassName  = makeValidClassName;
exports.makeWpFunctionName  = makeWpFunctionName;
exports.makeWpId  = makeWpId;
exports.RE_WORD_BOUNDARY = RE_WORD_BOUNDARY;