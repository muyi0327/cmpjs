
"use strict";
var inquirer = require("inquirer");
var output = require('./output');
var path = require('path');
var stream = require('stream');

exports.regist = function (program, pkg) {
  build(program, pkg);
  init(program, pkg);
}

/**
 *创建产物
 *
 **/
function build(program) {
  return program
          .command('build [dir]')
          .description('run build commands for components')
          .option("-f, --format [mode]", "Which setup mode to use")
          .action(function(dir, options){
              var mode = options.format || "all";
              dir = dir || '';
              console.log('setup for %s env(s) with %s mode', dir, mode);
          });
}

/**
 *创建配置文件命令
 *@param program {Object} Commander类
 *@param pkg {Object} 当组件package.json配置信息
 **/
function init(program, pkg) {
  return program
    .command('init [filename]')
    .description('Create component configuration file')
    .action(function (filename) {
      filename = filename || './cmp.config.js';
      var questions = [{
          type: "input",
          name: "name",
          message: "Please input component name",
          validate: function(val) {
            var pass = /^[a-zA-Z]+[a-zA-Z0-9_-]*$/g.test(String(val));
            if (!val || !pass){
              return 'Please enter a valid component name'
            }

            return true;
          },
          default: function () {
            return pkg.name;
          }
        },{
          type:"input",
          name:"entry",
          message:"Please enter the name of the component entry file",
          default:function () {
            return pkg.main||'./index.cmp';
          }
        },{
          type:"input",
          name:"description",
          message:"Please enter a component description information",
          default:''
        },{
          type:"input",
          name:"dest",
          message:"Enter the target path for the component file",
          default:function () {
            return './dist';
          }
        },{
          type: "list",
          name: "format",
          message: "Please enter the format of the component",
          choices: [ "all", "cjs", "amd", "umd" ],
          default: function(  ) {
            return 'all'
          }
        },{
            type: "confirm",
            name: "confirm",
            message: "Whether to confirm the above information",
            default: true
        }
      ];

      inquirer.prompt( questions, function( answers ) {
        if (!answers.confirm){
          return console.log('Aborting');
        }

        console.log("\nOrder receipt:");
        console.log( JSON.stringify(answers, null, "  ") );
        answers.filename = filename;
        output.createConfig(answers);
      });
    });
}
