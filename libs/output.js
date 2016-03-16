'use strict'

var fs = require('fs');
var path = require('path');
var StringToString = require('string-to-stream');

 *创建config文件
 *@param options {Object}
 **/
exports.createConfig = function(options){
  options = options || {};
  var name = options.name,
  dest = options.dest||'./',
  version = options.version,
  format = options.format,
  filename = options.filename,
  configFilePath;

  if (!name){
    throw(new Error('Component name required'));
  }

  configFilePath = path.join(__dirname,filename);

  StringToString(JSON.stringify({
    name:name,
    format:format
  }, null, "  ")).pipe(fs.createWriteStream(configFilePath))

  console.log(configFilePath);
}
