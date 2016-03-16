var parse5 = require('parse5');
var dom5 = require('dom5');
var fs = require('fs');
var babel = require('babel-core');

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
        var lang = dom5.getAttribute(node, 'lang'),
            src = dom5.getAttribute(node, 'src'),
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
exports.compileCss = function (str, originType, options) {
    return str;
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
 *
 *
 **/
exports.formatJs = function (str, formats, options) {
    console.log('babel:', str);
  var formatCodes = {};
  formats.forEach(function (format) {
      formatCodes[format] = babel.transform(str, {
          plugins: ["transform-es2015-modules-" + format]
      }).code;
  });

  return formatCodes;
}
