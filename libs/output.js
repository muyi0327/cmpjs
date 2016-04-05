'use strict'

var fs = require('fs');
var path = require('path');
var htmlMinifier = require('html-minifier').minify;
var util = require('./util');
var conf = require('./config');
var outputFormat = conf.format;
var baseDir = process.cwd();


/**
 * create product files from format object
 * {
 *    style: {},
 *    script: {},
 *    template: {}
 * }
 **/
exports.createFilesFromTags = function (tags, outputFormat, dest, filename, version) {
    var style, template, script;
    style = tags.style;
    util.compileCss(style.content, style.lang || 'sass', function (err, cssString) {
        if (err) {
            return console.log('Error occurred:' + err);
        }
        template = tags.template;
        script = tags.script;
        script = util.compileJs(script.content, script.lang || 'es6');

        template = template ? ("  var __template = '" + htmlMinifier(template.content, {
            removeComments: true,
            collapseWhitespace: true,
            removeTagWhitespace: true
        })) : '';

        cssString = cssString ? "';\n" + __cmp__importComponentStyle.toString()
        + '\n __cmp__importComponentStyle("' + cssString.replace('\n', '').replace(/"/g, "'") + '","' + filename + '");\n' : '';

        script = template + cssString + script;

        exports.createFormats(util.formatJs(script, outputFormat), filename, dest, version);
    });
}
/**
 * create build files
 **/
exports.createDest = function (config) {
    config = config || {};
    var name = config.name,
        format = config.format || 'all',
        dest = config.dest || './dist',
        version = config.version || '',
        entry = config.entry || './index.cmp',
        entryPath = typeof entry == 'string' && path.join(baseDir, entry),
        _tags = {},
        entryKeys, elen = 3;

    if (!name) {
        return console.log('Component name is required!');
    }

    if (typeof entry == 'string' && !fs.existsSync(path.join(baseDir, entry))) {
        //throw Error('Component entry file is required!');
        return console.log('Error occurred: component entry file is required!');
    }

    if (format && format !== 'all') {
        outputFormat = [format];
    }

    if (util.isType(entry, 'object')) {
        _tags.style = {
            type: 'style',
            lang: util.isType(entry.style, 'string') && entry.style.indexOf('!') > 0 ? entry.style.split('!')[0] : 'css'
        }

        _tags.script = {
            type: 'script',
            lang: util.isType(entry.script, 'string') && entry.script.indexOf('!') > 0 ? entry.script.split('!')[0] : 'es6'
        }

        _tags.template = {
            type: 'template',
            lang: '' // TODO set later
        }

        entryKeys = Object.keys(entry);

        return entryKeys.forEach(function (type) {
            var _url = entry[type];
            _url = _url.indexOf('!') > 0 ? _url.split('!')[1] : _url;
            fs.readFile(_url, function (err, str) {
                --elen;
                if (err) {
                    _tags[type].content = '';
                } else {
                    _tags[type].content = str.toString();
                }
                if (!elen) {
                    exports.createFilesFromTags(_tags, outputFormat, dest, name, version);
                }
            });
        });
    }

    fs.readFile(entryPath, function (err, data) {
        var tags;
        if (err) {
            throw err;
        }

        tags = util.analysisFileContent(data.toString());

        exports.createFilesFromTags(tags, outputFormat, dest, name, version);
    });
}

/** create config file
 *@param options {Object}
 **/
exports.createConfig = function (options) {
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
        return console.log('Component name is required!');
    }

    // the path of config file
    configFilePath = path.join(baseDir, filename);

    // create config file
    configString = JSON.stringify({
        name: name,
        dest: dest,
        format: format,
        entry: entry,
        importCss: false,
        version: version
    }, null, "  ");

    fs.writeFile(configFilePath, "'use strict'\n\nmodule.exports = " + configString, function (err) {
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
 * @param version {String}
 **/
exports.createFormats = function (formatCodes, name, dest, version) {
    var keys = Object.keys(formatCodes),
        fileLen = keys.length * 2;

    dest = path.join(baseDir, dest);

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }

    // version
    if (!fs.existsSync(path.join(dest, '/' + version))) {
        fs.mkdirSync(path.join(dest, '/' + version));
    }

    keys.forEach(function (k, i) {
        [name + '.' + k + '.js', name + '.' + k + '.min.js'].forEach(function (p) {
            var jsStr = formatCodes[k],
                isMin = p.indexOf('.min.js') > 0;
            if (isMin) {
                jsStr = util.compressJs(jsStr);
            }

            p = path.join(dest, '/' + version, p);
            fs.writeFile(p, jsStr, 'utf8', function (err, data) {
                if (err) {
                    return console.log(err);
                }
                console.log('creted file: ' + p + ' success');
                if (!--fileLen) console.log('build file end!');
            });
        });
    });
}


function __cmp__importComponentStyle(code, componentName) {
    var styleId = 'cmpjs_' + componentName;
    if (document.querySelector('#' + styleId)) {
        return;
    }
    var style = document.createElement("style");
    style.type = "text/css";
    style.id = styleId;
    try {
        style.appendChild(document.createTextNode(code));
    } catch (ex) {
        style.styleSheet.cssText = code;
    }
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(style);
}
