var output = require('./libs/output');
var baseDir = process.cwd();
var path = require('path');
var fs = require('fs');
var glob = require('glob');

/**
 * 
 */
exports.compileFilesToComponents = function (glob, options) {
    var files = glob.sync(glob, options);
    console.log(files);
}