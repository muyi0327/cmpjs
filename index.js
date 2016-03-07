#!/usr/bin/env node

var program = require('commander');
var parse5 = require('parse5');
var fs = require('fs');
var path = require('path');
var umdify = require('umdify');

program
    .version('1.0.0')
    .allowUnknownOption()
    .option('-f, --format [value]', 'set export format','all')
    .option('-c, --config [value]', 'set config file path', './cmp.config.js')
    .option('-b, --build [value]', 'set config file path', './example/test.js');

program.parse(process.argv);

if (program.format) {
    console.log('export file format type is ' + program.format);
}

if (program.config) {
    console.log('set config file path ' + program.config);
}

if(program.build){
    example(program.build);
}

function example(dir){
    var str = fs.readFileSync(dir, 'utf8');

    console.log(umdify(str));
}
console.log('program:'+program.format);