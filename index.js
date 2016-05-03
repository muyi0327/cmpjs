var output = require('./libs/output');
var baseDir = process.cwd();
var path = require('path');
var fs = require('fs');
var output = require('./libs/output');


exports.build = function (options, callback) {
    var components = options.components||[],
    dest = options.dest||'',
    format = options.format||'all';
    
    if (!components.length){
        console.log('components required!');
        return callback('components required!');
    }
    
    
}