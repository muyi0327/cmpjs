"use strict";
var inquirer = require("inquirer");
var path = require('path');
var fs = require('fs');
var output = require('./output');
var baseDir = process.cwd();
var conf = require('./config');
var defaultConfigPath = './cmp.config.js';
var regName = /\{\{\w+\}\}/g;

/**
 * regist commands
 **/
exports.regist = function (program) {
    build(program);
    init(program);
    create(program);
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
        .action(function (entry, options) {
            console.log('build file start..');
            options = options || {};
            var format = options.format,
                configSet = {},
                _entry, _format,
                configFilePath = path.join(baseDir, options.config || defaultConfigPath);

            if (!fs.existsSync(configFilePath)) {
                return console.log(
                    '\n\nConfig file does not exit, it is required.\nPlease create the config file with commad:\n\n       cmpjs init <filename>\n\n'
                );
            }

            configSet = require(configFilePath);

            _entry = configSet.entry;
            _format = configSet.format;

            // options is first
            configSet.entry = entry || _entry;
            configSet.format = format || _format || 'all';

            output.createDest(configSet);
        });
}

/**
 *create config file
 *@param program {Object} Commander Class
 **/
function init(program) {
    return program
        .command('init [filename]')
        .description('Create component configuration file')
        .action(function (filename) {
            filename = filename || './cmp.config.js';
            var pkg = require(path.join(baseDir + '/package.json'));
            var questions = [{
                type: "input",
                name: "name",
                message: "Please input component name?",
                validate: function (val) {
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
                default: function () {
                    return './index.cmp';
                }
            }, {
                type: "input",
                name: "version",
                message: "\n\nPlease enter the version of the component?",
                default: function () {
                    return pkg.version||'1.0.0';
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
                default: function () {
                    return './dist';
                }
            }, {
                type: "list",
                name: "format",
                message: "\n\nPlease enter the format of the component?",
                choices: ["all"].concat(conf.format),
                default: function () {
                    return 'all'
                }
            }, {
                type: "confirm",
                name: "confirm",
                message: "Whether to confirm the above information?",
                default: true
            }];

            inquirer.prompt(questions, function (answers) {
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


function create(program) {
    program
        .command('create <name>')
        .description('Create component configuration file')
        .action(function (name, options) {
            if(!name){
                return console.log('component name is required!')
            }

            var config = require('../template/config');
            var packageJSON = require('../template/package.json');

            config = "'use strict'\n\nmodule.exports=" + JSON.stringify(config,null,4);
            packageJSON = JSON.stringify(packageJSON,null,4);

            config = config.replace(regName, name);
            packageJSON = packageJSON.replace(regName, name);

            fs.writeFile(path.join(baseDir, './config.cpm.js'), config, function(err) {
                if (err) throw err;
                console.log('the file config.js is created success!');
            });

            fs.writeFile(path.join(baseDir, './package.json'), packageJSON, function(err) {
                if (err) throw err;
                console.log('the file ./package.json is created success!');
            });

            ['js', 'scss', 'html'].forEach(function(type){
                var fileName = './' + name + '.' + type;
                fs.writeFile(path.join(baseDir, fileName), '', function(err) {
                    if (err) throw err;
                    console.log('the file ' + fileName +' is created success!');
                });
            });

            fs.readFile(path.join(__dirname,'../template/index.cmp'), 'utf8', function(err, data){
                if (err) throw err;
                data = data.replace(regName, name);
                fs.writeFile(path.join(baseDir, './index.cmp'), data, function(err) {
                    if (err) throw err;
                    console.log('the file ./index.cmp is created success!');
                });
            });
        });
}
