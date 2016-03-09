exports.registerCommand = function(program){
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
