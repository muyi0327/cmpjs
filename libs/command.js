var inquirer = require("inquirer");

/**
 * 注册命令入口
 * @param program
 * @param packageJSON
 * @returns {Command}
 */
exports.registerCommand = function(program, packageJSON){
    // 构建最终发布到cdn产物
    exports.build(program);
    // 创建配置文件
    exports.init(program, {
        name: packageJSON.name
    });
}

/**
 * 构建最终产物命令
 * @param program {Commander}
 * @returns {Command}
 */
exports.build = function(program){
    return program
        .command('build [dir]')
        .description('create production file for components')
        .option("-f, --format [mode]", "Which module format to use", "all")
        .action(function(dir, options){
            var mode = options.format || "all";
            dir = dir || '';
            console.log('setup for %s env(s) with %s mode', dir, mode);
        });
}

/**
 * 创建配置文件
 * @param program {Commander}
 * @param options {Object} default options
 * @returns {Command}
 */
exports.init = function(program, options){
    options = options||{};
    var name = options.name||'',
        entry = options.entry||'./index.cmp',
        dest = options.dest||'./dist';
    return program
        .command('init [dir]')
        .description('run build commands for components')
        .action(function(dir){
            dir = dir || '';
            console.log('setup for %s env(s) with %s mode', dir);

            var questions = [{
                type: 'input',
                name: 'name',
                message: "What's your component name? <" + name + ">",
                default: function(){
                    return name;
                }
            },{
                type: 'input',
                name: 'entry',
                message: "What's your component entry? <" + entry + ">",
                default: function(){
                    return entry;
                }
            },{
                type: 'input',
                name: 'dest',
                message: "What's your component dest?",
                default: function(){
                    return dest;
                }
            }];

            // 发起对话
            inquirer.prompt(questions, function(answers){
                console.log( JSON.stringify(answers, null, "  ") );
            });
        });
}
