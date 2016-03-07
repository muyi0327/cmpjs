#!/usr/bin/env node

var program = require('commander');

program
.version('1.0.0')
.option('--f, format, set export format')
.parse(process.argv);

if (program.format == 'amd'){
    console.log('export file format type is amd');
}