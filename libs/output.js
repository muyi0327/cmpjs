'use strict'

var fs = require('fs');
var path = require('path');
var htmlMinifier = require('html-minifier').minify;
var util = require('./util');
var conf = require('./config');
var outputFormat = conf.format;
var baseDir = process.cwd();
var config = require('../template/config');
var packageJSON = require('../template/package.json');
var regName = /\{\{\w+\}\}/g;


/**
 * create component files from format object
 * {
 *  name: 'component-name',
 *  format: ['all'],
 *  version: '1.0.0',
 *  dest: './dist',
 *  tags: {
 *    style: {
 *      lang: 'sass',
 *      content: '',
 *      file: 'sass!./component.scss',
 *      import: false
 *    },
 *    script: {
 *      lang: 'es6',
 *      content: '',
 *      file:'ts!./component.ts'
 *    },
 *    template: {
 *      lang: 'ejs',
 *      content: '',
 *      file:'mustache!./component.html',
 *      import: false
 *   }
 *  }
 * }
 **/
exports.createFilesFromTags = function (cmpObj, callback) {
    var style, template, script, fileArr, scripts;
    var tags = cmpObj.tags, name = cmpObj.name, dest = cmpObj.dest, version = cmpObj.version, formats = cmpObj.formats;
    style = tags.style;
    // file is first
    if (style.file) {
        style.content = fs.readFileSync(path.resolve(baseDir, style.file));
    }
    util.compileCss(style.content, style.lang || 'sass', function (err, cssString) {
        if (err) {
            return console.log('Error occurred:' + err);
        }
        template = tags.template;
        script = tags.script;

        // file is first
        if (script.file) {
            script.content = fs.readFileSync(path.resolve(baseDir, script.file));
        }

        script = util.compileJs(script.content, script.lang || 'es6');

        // file is first
        if (template.file) {
            template.content = fs.readFileSync(path.resolve(baseDir, template.file));
        }

        template = (template.import && template.content) ? ("  var __template = '" + htmlMinifier(template.content, {
            removeComments: true,
            collapseWhitespace: true,
            removeTagWhitespace: true
        })) : '';

        cssString = (style.import && cssString) ? ("\n" + __cmp__importComponentStyle.toString()
            + '\n __cmp__importComponentStyle("' + cssString.replace(/\n/g, '').replace(/"/g, "'") + '","'
            + name + '");\n')
            : '';

        script = template + (style.import ? cssString : '') + script;

        // format object+
        scripts = util.formatJs(script, formats);

        exports.createFormats(scripts, name, dest, version);
    }, style.import !== false);
}

/**
 * create build files 
 **/
exports.createDest = function (config, callback) {
    config = config || {};
    var name = config.name,
        format = config.format || 'all',
        dest = config.dest || './dist',
        version = config.version || '',
        entry = config.entry || './src/index.cmp',
        entryPath = typeof entry == 'string' && path.join(baseDir, entry),
        _tags = {},
        cmpObj,
        entryKeys, elen = 3;

    if (!name) {
        return console.log('Component name is required!');
    }

    if (typeof entry == 'string' && !fs.existsSync(path.join(baseDir, entry))) {
        //throw Error('Component entry file is required!');
        return console.log('Error occurred: component entry file is required!');
    }

    if (format && !util.isType(format,'array')) {
        outputFormat = format == 'all' ? conf.format : [format];
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
                    cmpObj = {
                        tags: _tags,
                        formats: outputFormat,
                        dest: dest,
                        name: name,
                        version: version
                    }
                    exports.createFilesFromTags(cmpObj);
                }
            });
        });
    }

    util.analysisFileContent(entryPath, function (tags) {
        var cmpObj = {
            tags: tags,
            formats: outputFormat,
            dest: dest,
            name: name,
            version: version
        }
        exports.createFilesFromTags(cmpObj);
    });
}

/** 
 * create config file
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
        importCss: conf.importCss,
        importTemplate: conf.importTemplate,
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
    if (version && !fs.existsSync(path.join(dest, '/' + version))) {
        fs.mkdirSync(path.join(dest, '/' + version));
    }

    keys.forEach(function (k, i) {
        [name + '.' + k + '.js', name + '.' + k + '.min.js'].forEach(function (p) {
            var jsStr = formatCodes[k],
                isMin = p.indexOf('.min.js') > 0;
            if (isMin) {
                jsStr = util.compressJs(jsStr);
            }

            p = version ? path.join(dest, '/' + version, p) : path.join(dest, p);
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

/**
 * create component files
 * @param name {String} component name
 * @param options {Object} component options
 */
exports.createComponent = function (name, options) {
    options = options || {};

    var combine = !!options.combine,
    createNum = 7,
    entryFile = './src/index.cmp';
    
    function checkEnd(){
        if (!--createNum){
            process.exit(0);
        }
    }

    // create cmp.config.js file
    createConf({ name: name , regData:{
        name: name,
        entry: entryFile
    }}, function (err) {
        if (err) throw err;
        checkEnd();
        console.log('the file cmp.config.js created success!')
    });

    // create package.json
    createPkg({ name: name }, function (err) {
        if (err) throw err;
        checkEnd();
        console.log('the file ./package.json is created success!');
    });

    // create .gitignore
    createIgnore({ name: name }, function (err) {
        if (err) throw err;
        checkEnd();
        console.log('the file .gitignore is created success!');
    });

    // create karma.conf.js
    createTest({ name: name }, function (err) {
        if (err) throw err;
        checkEnd();
        console.log('the file karmak.conf.js is created success!');
    });

    // create readme
    createReadme({ name: name }, function (err) {
        if (err) throw err;
        checkEnd();
        console.log('the file ./README.md is created success!');
    });

    // create test files
    createTestDir({ name: name }, function (err) {
        if (err) throw err;
        checkEnd();
        console.log('the director test  is created success!');
    });

    // create src files
    createSrc({ name: name, combine: combine, entryFile: entryFile}, function (err) {
        if (err) throw err;
        checkEnd();
        console.log('the director src  is created success!');
    });
}

/**
 * create src director
 * @param  {Object} opts
 * @param  {Function} callback
 */
function createSrc(opts, callback) {
    if (!opts) {
        return callback('arguments error')
    }
    var name = opts.name,
        entryFile = opts.entryFile,
        combine = opts.combine,
        dirName = path.join(baseDir, './' + name);

    // create src dir
    if (!fs.existsSync(path.join(dirName, './src'))) {
        fs.mkdirSync(path.join(dirName, './src'));
    }
    
    // create entry
    createEntery({ name: name, combine: combine, subDir: './src'}, function (err) {
        if (err) throw err;
        console.log('the file ./src/index.cmp is created success!');
    });

    if (combine) {
        return callback();
    }

    // create development file
    ['js', 'scss', 'html'].forEach(function (type) {
        var fileName = './src/' + name + '.' + type;
        var content = '';
        switch (type) {
            case 'scss':
                content = '.' + name + ' {\n\n}';
                break;
            case 'html':
                content = '<' + name + '></' + name + '>';
                break;
            case 'js':
                content = '';
                break;
            default:
                break;
        }
        fs.writeFile(path.join(dirName, fileName), content, function (err) {
            if (err) {
                callback();
                throw err;
            }
            if (type=='html'){
                callback();
            }
            console.log('the file ' + fileName + ' is created success!');
        });
    });
}

/**
 * create .gitignore
 * @param  {Object} opts
 * @param  {Function} callback
 */
function createIgnore(opts, callback) {
    if (!opts) {
        return callback('arguments error')
    }

    opts.fileName = '.gitignore';
    createFileFromeTemplate(opts, callback);
}

/**
 * create karma.conf.js
 * @param  {Object} opts
 * @param  {Function} callback
 */
function createTest(opts, callback) {
    if (!opts) {
        return callback('arguments error')
    }

    opts.fileName = 'karma.conf.js';
    createFileFromeTemplate(opts, callback);
}

/**
 * create readme
 * @param  {Objectany} opts
 * @param  {Function} callback
 */
function createReadme(opts, callback) {
    if (!opts) {
        return callback('arguments error')
    }

    opts.fileName = 'README.md';
    createFileFromeTemplate(opts, callback);
}

/**
 * create entry
 * @param  {Objectany} opts
 * @param  {Function} callback
 */
function createEntery(opts, callback) {
    if (!opts) {
        return callback('arguments error')
    }
    var combine = opts.combine;

    opts.fileName = combine ? 'index.combine.cmp' : 'index.cmp';
    opts.distName = 'index.cmp';
    createFileFromeTemplate(opts, callback);
}

/**
 * create config.js
 * @param  {Objectany} opts
 * @param  {Function} callback
 */
function createConf(opts, callback) {
    if (!opts) {
        return callback('arguments error')
    }
    opts.fileName = 'config.js';
    opts.distName = 'cmp.config.js';
    createFileFromeTemplate(opts, callback);
}

/**
 * create package.json
 * @param  {Objectany} opts
 * @param  {Function} callback
 */
function createPkg(opts, callback) {
    if (!opts) {
        return callback('arguments error')
    }
    opts.fileName = 'package.json';
    createFileFromeTemplate(opts, callback);
}

/**
 * create test director
 * @param  {Objectany} opts
 * @param  {Function} callback
 */
function createTestDir(opts, callback) {
    var name = opts.name,
        dirName = path.join(baseDir, './' + name);

    if (!fs.existsSync(path.join(dirName, './test'))) {
        return fs.mkdir(path.join(dirName, './test'), function (err) {
            if (err) throw err;
            callback();
        });
    }

    callback();
}

/**
 * create files from template
 * @param  {Objectany} opts
 * @param  {Function} callback
 */
function createFileFromeTemplate(opts, callback) {

    opts = opts || {};
    var name = opts.name,
        fileName = opts.fileName,
        subDir = opts.subDir || '',
        distName = opts.distName || fileName,
        regData = util.assign({}, opts.regData||{},{name:name}),
        subDir = opts.subDir || '',
        dir = path.join(baseDir, './' + name, subDir),
        url = path.join(__dirname, '../template/' + fileName),
        _pkg = fs.readFile(url, function (err, data) {
            if (err) {
                return console.log(err);
            }

            data = String(data).replace(new RegExp('{{(\\w+)}}','g'), function () {
                return regData[arguments[1]] || '';
            });

            fs.writeFile(path.join(dir, './' + distName), data, function (err) {
                if (err) {
                    return console.log(err);
                }
                callback();
            });
        });
}

/**
 * 
 */
function compileCss() {

}

/**
 * 内置导入样式函数
 */
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

// create config.js
exports.createConf = createConf;

//  create package.json
exports.createPkg = createPkg;

// create entery
exports.createEntery = createEntery;

// create README.md
exports.createReadme = createReadme;

// create karma.conf.js
exports.createTest = createTest;