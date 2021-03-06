var parse5 = require('parse5');
var dom5 = require('dom5');
var fs = require('fs');
var path = require('path');
var babel = require('babel-core');
var baseDir = process.cwd();
var sass = require('node-sass');
var stream = require('stream');
var less = require('less');
var tsc = require('typescript-compiler');
var coffee = require('coffee-script');
var UglifyJS = require('uglify-js');
var es2015 = require('babel-preset-es2015');
var stage3 = require('babel-preset-stage-3');
var OS = Object.prototype.toString;

/**
 * analysis childNodes to {template, style, script}
 * @param file {String}
 * @return {Object}
 */
exports.analysisFileContent = function (file, callback) {
    var analysis = {};

    fs.readFile(file, function (err, data) {
        var str = data.toString(), fragment, nodes;
        
        fragment = parse5.parseFragment(str);
        nodes = fragment.childNodes || [];

        nodes.forEach(function (node, index) {
            var lang = dom5.getAttribute(node, 'lang') || '',
                src = dom5.getAttribute(node, 'src') || '',
                content = '';
            if (node.nodeName === '#text') return;

            content = exports.getNodeContent(node)
            
            src = path.resolve(path.dirname(file), src);
            
            analysis[node.nodeName] = {
                type: node.nodeName,
                lang: lang,
                content: content,
                file: src
            }
        });
        
        callback(analysis);
    });
};

/**
 * get node text
 * @param node
 * @return {String}
 */
exports.getNodeContent = function (node) {
    if (!node) {
        return '';
    }
    var childNodes = node.childNodes,
        content = node.content,
        last = childNodes && childNodes[0];

    // get template content
    if (node.nodeName === 'template') {
        return parse5.serialize(content);
    }

    if (!last || last.nodeName !== '#text') {
        return '';
    }
    return last.value;
};

/**
 * compile string to cssString
 * @param str {String}
 * @param originType {String} sass or less
 * @param options {Object}
 **/
exports.compileCss = function (str, originType, callback, importCss) {

    var cssStr = '';
    originType = originType || 'sass';

    if (typeof callback !== 'function') {
        return console.log('arguments 2 must be a function!');
    }

    if (!importCss) {
        return callback(null, '');
    }

    if (str instanceof Buffer) {
        str = str.toString();
    }

    if (typeof str !== 'string') {
        return callback('arguments 0 must be a string');
    }

    switch (originType) {
        case 'sass':
            sass.render({
                data: str,
                outputStyle: 'compressed'
            }, function (err, result) {
                if (typeof callback == 'function') {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, result.css.toString());
                }
            });
            break;
        case 'less':
            less.render(str, {
                compress: true
            }, function (err, cssTree) {
                if (typeof callback == 'function') {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, cssTree.css);
                }
            });
            break;
        default:
    }
}

/**
 * compile string to jsString
 * @param str {String}
 * @param originType {String} coffe, es6, typeScript
 * @param options {Object}
 **/
exports.compileJs = function (str, originType, options) {
    str = str || '';
    switch (originType) {
        case 'ts':
            str = tsc.compileString(str);
            break;
        case 'coffee':
            str = coffee.compile(str, {
                bare: 'on'
            });
            console.log(str);
            break;
        default:

    }

    return str;
}

/**
 * format jsString
 * @param str {String} jsString
 * @param formats {Array} format types amd, umd, commonjs
 **/
exports.formatJs = function (str, formats, options) {
    var formatCodes = {};
    formats.forEach(function (format) {
        var _format = format, _str;
        if (format == 'cmd') {
            _format = 'commonjs';
        }

        _str = babel.transform(str, {
            presets: [es2015, stage3],
            plugins: [require("babel-plugin-transform-es2015-modules-" + _format)]
        }).code;

        if (format == 'cmd') {
            _str = 'define(function(require, exports, module){\n' + _str + '\n});'
        }

        formatCodes[format] = _str;
    });

    return formatCodes;
}

/**
 * compress javascript file
 * @param code {String} javascript string
 **/
exports.compressJs = function (code) {
    var ast = UglifyJS.parse(code);
    ast.figure_out_scope();
    ast.compute_char_frequency();
    ast.mangle_names();
    code = ast.print_to_string();

    return code;
}

exports.isType = function (o, type) {
    return OS.call(o).toLocaleLowerCase() == '[object ' + type.toLowerCase() + ']';
}

/**
 * 
 */
exports.assign = function (target) {
    'use strict';
    if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    var output = Object(target);
    for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
            for (var nextKey in source) {
                if (source.hasOwnProperty(nextKey)) {
                    output[nextKey] = source[nextKey];
                }
            }
        }
    }
    return output;
};

/**
 * string to stream
 */
exports.strToStream = function(str){
    var s = new stream.Readable();
    s._read = function noop() {}; // redundant? see update below
    s.push(str);
    s.push(null);
    return s;
}
