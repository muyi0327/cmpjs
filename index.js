#!/usr/bin/env node

var program = require('commander');
var parse5 = require('parse5');

program
.version('1.0.0')
.option('-f, --format, set export format')
.parse(process.argv);

if (program.format == 'amd'){
    console.log('export file format type is amd');
}