#!/usr/bin/env node

var program = require('commander');
var command = require('./libs/command.js');

program
    .version('1.0.4')
    .allowUnknownOption();

// register commands
command.regist(program);

program.parse(process.argv);
