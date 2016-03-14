'use strict'

var fs = require('fs');
var path = require('path');

/**
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

  configFilePath = path.join(__dirname, path.resolve(dest, filename));

  console.log(configFilePath);

}
