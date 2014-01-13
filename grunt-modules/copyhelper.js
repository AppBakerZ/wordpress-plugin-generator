"use strict;"

/**************************************
 * Author: Kashif Iqbal Khan
 * Email: kashiif@gmail.com
 * License: MIT
 * Copyright (c) 2013-2014 Kashif Iqbal Khan
 **************************************/

var fs  = require('fs'),
    path = require('path');

function isDir(abspath, found, counts, callback) {
    fs.stat(abspath, function(err, stat) {
        if(stat.isDirectory()) {
            found.dirs.push(abspath);
            // If we found a directory, recurse!
            walk(abspath, function(err, data) {
                found.dirs = found.dirs.concat(data.dirs);
                found.files = found.files.concat(data.files);
                if(++counts.processed == counts.total) {
                    callback(null, found);
                }
            });
        } else {
            found.files.push(abspath);
            if(++counts.processed == counts.total) {
                callback(null, found);
            }
        }
    });
}

function walk(start, callback) {
    // Use lstat to resolve symlink if we are passed a symlink
    fs.lstat(start, function(err, stat){
      var found = {dirs: [], files: []},
          counts = {
            total: 0,
            processed: 0
          };
      // Read through all the files in this directory
      if(stat.isDirectory()) {
          fs.readdir(start, function (err, files) {
              counts.total = files.length;
              for(var x=0, l=files.length; x<l; x++) {
                  isDir(path.join(start, files[x]), found, counts, callback);
              }
          });
      } else {
          return callback(new Error("path: " + start + " is not a directory"));
      }
    });
};

exports.walk = walk;
