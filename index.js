var output = require('./libs/output');
var baseDir = process.cwd();
var path = require('path');
var fs = require('fs');
var output = require('./libs/output');

/**
 * 
 */
exports.compileFilesToComponents = function (obj) {
    output.createFilesFromTags(obj);
}