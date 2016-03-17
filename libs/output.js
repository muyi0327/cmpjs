'use strict'

var fs = require('fs');
var path = require('path');
var util = require('./util');
var baseDir = process.cwd();
var dom5 = require('dom5');
var parse5 = require('parse5');
var htmlMinifier = require('html-minifier').minify;
var outputFormat = ['amd', 'commonjs', 'umd', 'systemjs'];

/**
 * create build files
 **/
exports.createDest = function(config) {
    config = config || {};
    var name = config.name,
        format = config.format || 'all',
        dest = config.dest || './dist',
        entry = config.entry || './index.cmp',
        entryPath = path.join(baseDir, entry),
        fragment;

    if (!name) {
        throw Error('Component name is required!');
    }

    if (!fs.existsSync(path.join(baseDir, entry))) {
        throw Error('Component entry file is required!');
    }

    if (format && format !== 'all') {
        outputFormat = [format];
    }

    fs.readFile(entryPath, function(err, data) {
        var tags, style, template, script;
        if (err) {
            throw err;
        }

        tags = util.analysisFileContent(data.toString());

        style = tags.style;
        style = util.compileCss(style.content, style.lang||'sass');

        template = tags.template;

        script = tags.script;
        script = util.compileJs(script.content, script.lang || 'es6');

        script = "  var template = '" + htmlMinifier(template.content, {
            removeComments: true,
            collapseWhitespace: true,
            removeTagWhitespace: true
        }) + "';\n" + script;

        exports.createFormats(util.formatJs(script, outputFormat), name, dest);
    });
}

/** create config file
 *@param options {Object}
 **/
exports.createConfig = function(options) {
    options = options || {};
    var name = options.name,
        dest = options.dest || './dist',
        version = options.version,
        format = options.format,
        entry = options.entry,
        filename = options.filename,
        configFilePath,
        configString;

    if (!name) {
        throw (new Error('Component name required'));
    }

    // the path of config file
    configFilePath = path.join(baseDir, filename);

    // create config file
    configString = JSON.stringify({
        name: name,
        dest: dest,
        format: format,
        entry: entry
    }, null, "  ");

    fs.writeFile(configFilePath, "'use strict'\n\nmodule.exports = " + configString, function(err) {
        if (err) throw err;
        console.log('It\'s saved!');
        // exit
        process.exit();
    });

    console.log('config:' + configFilePath);
}

/**
 * create format files
 * @param formatCodes {Object}
 * @param name {String}
 * @param dest {String}
 **/
exports.createFormats = function(formatCodes, name, dest) {
    var keys = Object.keys(formatCodes);
    dest = path.join(baseDir, dest);
    if (!fs.existsSync(dest)){
        fs.mkdirSync(dest);
    }
    keys.forEach(function(k, i) {
        [name + '.' + k + '.js', name + '.' + k + '.min.js'].forEach(function(p) {
          p = path.join(dest, p);
          fs.writeFile(p, formatCodes[k], function (err, data) {
              if(err){
                  return console.log(err);
              }
              console.log(p);
          });
        });
    });
}
