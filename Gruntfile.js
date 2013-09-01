"use strict;"
function extend(defaults, override){
    for(var key in override) {
        if(override.hasOwnProperty(key)) {
            defaults[key] = override[key];
        }
    }
    return defaults;
}

function copyValueIfMissing(obj, key1, key2){ 
  if (!obj.hasOwnProperty(key1) || obj[key1].length == 0) {
    obj[key1] = obj[key2];
  }
}

function isValidIdentifier(name) {
  return true;
}

function makeValidIdentifier(name) {
  return name.trim().replace(/\W+/g, "");
}

module.exports = function(grunt) {

  var path  = require('path');

  var userParams = grunt.file.readJSON('build.json'),
      buildParams = {
        "author-name": "",
        "author-uri": "",
        "author-email": "",
        "owner-name": "",
        "owner-uri": "",
        "owner-email": "",
        "plugin-name": "",
        "plugin-slug": "",
        "plugin-desc": "",
        "plugin-uri": ""
      };
  
  // Valid that user has provided some values for required parameters in build.json
  var missing = ["plugin-name", "author-name", "author-email"].filter(function(item) {
      var v = userParams[item]; 
      return (!v || v.trim().length == 0);
    });
    
  if (missing.length) {
    grunt.fail.fatal("Not found valid values for: " + missing);
    return;
  }

  
    
  extend(buildParams, userParams);
  for(var key in buildParams) {
      if(buildParams.hasOwnProperty(key)) {
        buildParams[key] = buildParams[key].trim();
      }
  }
  
  var re = new RegExp("\\s", "g");
	if (buildParams["plugin-slug"]) {
    // TODO: validate that plugin-slug should not contain invalid chars
  } else {
    // auto generated plugin-slug should be a valid file-system name
    buildParams["plugin-slug"] = buildParams["plugin-name"].toLowerCase().replace(re, '-');
  }
  
	if (buildParams["plugin-class-name"]) {
    // TODO: validate that className is valid identifier
  } else {
    // auto generated plugin-class-name should be a valid identifier
    buildParams["plugin-class-name"] = makeValidIdentifier(buildParams["plugin-name"].replace(re, '_'));
  }
  buildParams["plugin-class-name-upper"] = buildParams["plugin-class-name"].toUpperCase();
  
  copyValueIfMissing(buildParams, "owner-name", "author-name");
  copyValueIfMissing(buildParams, "owner-email", "author-email");
  copyValueIfMissing(buildParams, "owner-uri", "author-uri");

	var pkg = grunt.file.readJSON('package.json'),
      distdir = 'dist/' + buildParams["plugin-slug"] + '/', // The path to package directory
      replacements = [];
  
  for(key in buildParams) {
      if(buildParams.hasOwnProperty(key)) {
          replacements.push({
              pattern: new RegExp("\{" + key + "\}", "g"),
              replacement: buildParams[key]
            });
      }
  }
  

  // TODO: copy index.php to every directory in distdir
	// Project configuration.
	grunt.initConfig({
	distdir: distdir,


	"string-replace": {
	  prod: {
      options: {
        replacements: replacements
      },

      files: [
        {expand: true, cwd: 'src/plugin-template', src : ['**/*.*', '!**/modules/*.jsm'],  dest: distdir }
        ]
    },
	},
  

	fileregexrename: {
	  prod: {
      options: {
        replacements: replacements
      },
      files: [ { expand: true, cwd: distdir, src: '**/*.*', dest: distdir }]

	  },
	  
	}
  
  
	});

	//grunt.loadNpmTasks('grunt-contrib-copy');

	//grunt.loadNpmTasks('grunt-preprocess');

  grunt.loadNpmTasks('grunt-string-replace');

  grunt.loadNpmTasks('grunt-file-regex-rename');
  
	// Default task(s).
	grunt.registerTask('default', ['string-replace',  'fileregexrename']);
};