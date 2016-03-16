#!/usr/bin/env node
console.log(1111111)
var program = require('commander');
var parse5 = require('parse5');
var dom5 = require('dom5');
var fs = require('fs');
var path = require('path');
var babel = require('babel-core');
var outputFormat = ['amd', 'commonjs', 'umd'];
var util = require('./libs/util.js');
var command = require('./libs/command.js');
console.log(__dirname)
var pkg = require(path.join(__dirname, './package.json'));

program
    .version('1.0.3')
    .allowUnknownOption()
    .option('-c, --config [value]', 'set config file path', './cmp.config.js');

// 注册命令
command.regist(program, pkg);

program.parse(process.argv);

if (program.format !== 'all') {
    outputFormat = [program.format];
    // console.log('export file format type is ' + program.format);
}

if (program.config) {
    // console.log('set config file path ' + program.config);
}

if (program.build) {
    //example(program.build);
    // console.log('structor:' + JSON.stringify(readComponent(program.build)));
}

function example(dir) {
    var str = fs.readFileSync(dir, 'utf8'), codes;

    codes = outputFormat.map(function (format) {
        return babel.transform(str, {
            plugins: ["transform-es2015-modules-" + format]
        }).code
    });

    // console.log(codes.join('\n'));
    return codes;
}

function readComponent(dir){
    var str = fs.readFileSync(dir, 'utf8');
    var fragment = parse5.parseFragment(str);
    return util.analysisFileContent(fragment.childNodes);
}
// console.log('program:' + program.format);
