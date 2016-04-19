#!/usr/bin/env node

var program = require('commander');
var command = require('../libs/command.js');
var pkg = require('../package.json');

program
    .version(pkg.version)
    .allowUnknownOption();

// register commands
command.regist(program);

program.parse(process.argv);
