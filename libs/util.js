var parse5 = require('parse5');
var dom5 = require('dom5');
var fs = require('fs');
var babel = require('babel-core');
var baseDir = process.cwd();
var sass = require('node-sass');
var less = require('less');
var UglifyJS = require('uglify-js');
var es2015 = require('babel-preset-es2015');
var stage3 = require('babel-preset-stage-3');

/**
 * analysis childNodes to {template, style, script}
 * @param str {String}
 * @return {Object}
 */
exports.analysisFileContent = function (str) {
    var analysis = {}, fragment, nodes;

    fragment = parse5.parseFragment(str);
    nodes = fragment.childNodes||[];

    nodes.forEach(function (node, index) {
        var lang = dom5.getAttribute(node, 'lang')||'',
            src = dom5.getAttribute(node, 'src')||'',
            content = '';
        if (node.nodeName==='#text') return;
        if (!!src){
            content = fs.readFileSync(src, 'utf8');
        }else{
            content = exports.getNodeContent(node)
        }

        analysis[node.nodeName] = {
            type: node.nodeName,
            lang:  lang,
            content: content
        }
    });

    return analysis;
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
    if (node.nodeName === 'template'){
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
exports.compileCss = function (str, originType, callback) {
    var cssStr='';
    originType = originType || 'sass';

    if (typeof callback !== 'function'){
      return console.log('arguments 2 must be a function!');
    }

    if (typeof str !== 'string'){
        return callback('arguments 0 must be a string');
    }

    if(originType==='sass'){
        sass.render({
            data:str,
            outputStyle:'compressed'
        }, function (err, result) {
            if (typeof callback == 'function'){
                if (err){
                    return callback(err);
                }
                callback(null, result.css.toString());
            }
        });
    }else if(originType==='less'){
        less.render(str, {compress:true},function (err, cssTree) {
            if (typeof callback == 'function'){
                if (err){
                    return callback(err);
                }
                callback(null, cssTree.css);
            }
        });
    }
}

/**
 * compile string to jsString
 * @param str {String}
 * @param originType {String} coffe, es6, typeScript
 * @param options {Object}
 **/
exports.compileJs = function (str, originType, options) {
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
      formatCodes[format] = babel.transform(str, {
          presets: [es2015, stage3],
          plugins: [require("babel-plugin-transform-es2015-modules-" + format)]
      }).code;
  });

  return formatCodes;
}


exports.compressJs = function (code) {
  var ast = UglifyJS.parse(code);
  ast.figure_out_scope();
  ast.compute_char_frequency();
  ast.mangle_names();
  code = ast.print_to_string();

  return code;
}
