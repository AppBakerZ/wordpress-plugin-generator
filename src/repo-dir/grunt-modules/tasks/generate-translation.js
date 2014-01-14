"use strict;"

/**************************************
 * Author: Kashif Iqbal Khan
 * Email: kashiif@gmail.com
 * License: MIT
 * Copyright (c) 2014 Kashif Iqbal Khan
 **************************************/

var fs = require("fs"),
    gettextParser = require("gettext-parser"),
    grunt = null;

const RE_TOKEN_EXTRACTOR = /__\(\s*('(.+)'|"(.+)")\s*,\s*('.+'|".+")\s*\)/g;

function msgTextForPot(str) {
  return "";
}

function msgTextForPo(str) {
  return str;
}

function msgTextForTestPo(str) {
  return "~" + str + "~";
}

function updateFile(dest, tokens, fmsgText, updateMethod) {

  // read existing pot file
  var bufPo = fs.readFileSync(dest);
  var translationFile = gettextParser.po.parse(bufPo);

  // pick the translations of default context
  var translations = translationFile.translations[""];

  var updateCount = 0;

  for (var prop in tokens) {
    if (updateMethod != "overwrite" && translations.hasOwnProperty(prop)) {
      grunt.log.debug("Skipping: " + prop);
      // TODO: update reference
    }
    else {
      grunt.log.debug("Adding: " + prop);
      var t = tokens[prop];
      t["msgstr"] = fmsgText( t["msgid"]);
      translations[prop] = t;

      updateCount++;
    }
  }

  var compiled = null;

  // always generate file when updateMethod is overwrite or touch or a new entry is found
  if (updateMethod != "append" || updateCount) {
    compiled = gettextParser.po.compile(translationFile);
    grunt.file.write(dest, compiled);
  }

  return {
    compiled: compiled,
    updateCount: updateCount
  };

}

module.exports = function(gruntLocal) {

  grunt = gruntLocal;

  grunt.registerMultiTask("generate-translation", "generates .po file", function() {

    var path = require("path");

    //prettyPrint(this, "");

    // Merging options with defaults
    var options = this.options({
      /**
       * Translation update method. Must be one of overwrite, touch or append
       *
       * overwrite: regenerate file completely overwriting any existing translation
       * touch: Always regenerate file keeping existing entries even when no new entry is found.
       * append: Regenerate file keeping existing entries only if a new entry is found.
       */
      method: 'append'
    });

    this.files.forEach(function(f) {
      var tokens = {};

      f.src.forEach(function(src) {
        grunt.log.debug("f: " + src + " - " + f.dest);
        var content = grunt.file.read(src),
          match;

        //grunt.log.debug("content.length " + content.length);

        while ((match = RE_TOKEN_EXTRACTOR.exec(content))) {
          var str = match[2] || match[3];

          if (tokens.hasOwnProperty (str)) {
            var existing = tokens[str];
            // TODO: avoid duplicate source files
            existing.comments.reference += " " + src + ":1";
            return;
          }

          tokens[str] = {
            "msgid": str,
            "comments": {
              "reference": src + ":1"
            },
            "msgstr": []
          };
          grunt.log.debug(match[2]);
        }

        grunt.log.debug("-");

      }); // end f.src.forEach

      var basename = path.basename(f.dest, ".pot"),
        dirname = path.dirname(f.dest);

      // generate pot file
      var updateFileResult = updateFile(f.dest, tokens, msgTextForPot, options.method);

      if (updateFileResult.compiled) {

        // generate en-US po file
        updateFileResult = updateFile(path.join(dirname, basename + "-en_US.po"), JSON.parse(JSON.stringify(tokens)), msgTextForPo, options.method);
        var compiledPo = updateFileResult.compiled;

        var compiledMo = gettextParser.mo.compile(compiledPo);

        grunt.file.write(path.join(dirname, basename + "-en_US.mo"), compiledMo);

        // generate en-US-test po file
        updateFileResult = updateFile(path.join(dirname, basename + "-en_TEST.po"), JSON.parse(JSON.stringify(tokens)), msgTextForTestPo, options.method);
        compiledPo = updateFileResult.compiled;

        compiledMo = gettextParser.mo.compile(compiledPo);
        grunt.file.write(path.join(dirname, basename + "-en_TEST.mo"), compiledMo);
      }

    }); // this.files.forEach

  });

};