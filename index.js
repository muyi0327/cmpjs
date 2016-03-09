#!/usr/bin/env node

var program = require('commander');
var parse5 = require('parse5');
var dom5 = require('dom5');
var fs = require('fs');
var path = require('path');
var babel = require('babel-core');
var outputFormat = ['amd', 'commonjs', 'umd'];
var util = require('./libs/util.js');

program
    .version('1.0.0')
    .allowUnknownOption()
    .option('-f, --format [value]', 'set export format all, amd, cjs, umd, default all', 'all')
    .option('-c, --config [value]', 'set config file path', './cmp.config.js')
    .option('-b, --build [value]', 'set config file path', './example/test.js');

program.parse(process.argv);

if (program.format !== 'all') {
    outputFormat = [program.format];
    console.log('export file format type is ' + program.format);
}

if (program.config) {
    console.log('set config file path ' + program.config);
}

if (program.build) {
    //example(program.build);
    console.log('structor:' + JSON.stringify(readComponent(program.build)));
}

function example(dir) {
    var str = fs.readFileSync(dir, 'utf8'), codes;

    codes = outputFormat.map(function (format) {
        return babel.transform(str, {
            plugins: ["transform-es2015-modules-" + format]
        }).code
    });

    console.log(codes.join('\n'));
    return codes;
}

function readComponent(dir){
    var str = fs.readFileSync(dir, 'utf8');
    var fragment = parse5.parseFragment(str);
    return util.analysisFileContent(fragment.childNodes);
}
console.log('program:' + program.format);