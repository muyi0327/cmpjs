"use strict";
var inquirer = require("inquirer");
var create = require('./create');
var path = require('path');


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
 *@param
 **/
function init(program, pkg) {
  return program
    .command('init [filename]')
    .description('Create component configuration file')
    .action(function (filename) {
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
          message:"Please enter component entry filename",
          default:function () {
            return pkg.main||'./index.cmp';
          }
        },{
          type:"input",
          name:"dest",
          message:"Please enter component dist path",
          default:function () {
            return './dist';
          }
        },{
          type: "list",
          name: "format",
          message: "Please select the build file format",
          choices: [ "all", "cjs", "amd", "umd" ],
          default: function(  ) {
            return 'all'
          }
        },{
            type: "confirm",
            name: "confirm",
            message: "confirm all confirm set",
            default: true
        }
      ];

      inquirer.prompt( questions, function( answers ) {
        console.log("\nOrder receipt:");
        console.log( JSON.stringify(answers, null, "  ") );
      });
    });
}
