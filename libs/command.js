"use strict";
var inquirer = require("inquirer");
var path = require('path');
var fs = require('fs');
var output = require('./output');
var baseDir = process.cwd();
var conf = require('./config');
var defaultConfigPath = './cmp.config.js';

/**
 * regist commands
 **/
exports.regist = function(program) {
    build(program);
    init(program);
}

/**
 *create format components file
 *@param program {Object} Commander类
 **/
function build(program) {
    return program
        .command('build [entry]')
        .description('run build commands for components')
        .option("-f, --format [mode]", "Which setup mode to use")
        .option("-c, --config [path]", "config file path")
        .action(function(entry, options) {
            console.log('build file start..');
            options = options || {};
            var format = options.format || "all",
                configSet = {},
                configFilePath = path.join(baseDir,options.config || defaultConfigPath);

            if (!fs.existsSync(configFilePath)) {
                return console.log(
                    '\n\nConfig file does not exit, it is required.\nPlease create the config file with commad:\n\n       cmpjs init <filename>\n\n'
                );
            }

            configSet = require(configFilePath);

            var _entry = configSet.entry;
            var _format = configSet.format;

            // options is first
            configSet.entry = entry || _entry;
            configSet.entry = format || _format;

            output.createDest(configSet);
        });
}

/**
 *create config file
 *@param program {Object} Commander Class
 *@param pkg {Object} npm package.json
 **/
function init(program) {
    return program
        .command('init [filename]')
        .description('Create component configuration file')
        .action(function(filename) {
            filename = filename || './cmp.config.js';
            var questions = [{
                type: "input",
                name: "name",
                message: "Please input component name?",
                validate: function(val) {
                    var pass = /^[a-zA-Z]+[a-zA-Z0-9_-]*$/g.test(String(val));
                    if (!val || !pass) {
                        return 'Please enter a valid component name'
                    }

                    return true;
                }
            }, {
                type: "input",
                name: "entry",
                message: "\n\nPlease enter the name of the component entry file?",
                default: function() {
                    return './index.cmp';
                }
            }, {
                type: "input",
                name: "description",
                message: "\n\nPlease enter a component description information?",
                default: 'component info'
            }, {
                type: "input",
                name: "dest",
                message: "\n\nEnter the target path for the component file?",
                default: function() {
                    return './dist';
                }
            }, {
                type: "list",
                name: "format",
                message: "\n\nPlease enter the format of the component?",
                choices: ["all"].concat(conf.format),
                default: function() {
                    return 'all'
                }
            }, {
                type: "confirm",
                name: "confirm",
                message: "Whether to confirm the above information?",
                default: true
            }];

            inquirer.prompt(questions, function(answers) {
                if (!answers.confirm) {
                    return console.log('Aborting');
                }
                var _answers = JSON.parse(JSON.stringify(answers));
                delete _answers.confirm;
                console.log('config:\n', JSON.stringify(answers, null, "  "));
                answers.filename = filename;
                output.createConfig(answers);
            });
        });
}
