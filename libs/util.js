var parse5 = require('parse5');
var dom5 = require('dom5');
var fs = require('fs');

/**
 * 解析组件文件
 * @param nodes
 */
exports.analysisFileContent = function (nodes) {
    var analysis = {};
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
 * 获取节点内容
 * @param node
 */
exports.getNodeContent = function (node) {
    if (!node) {
        return '';
    }
    var childNodes = node.childNodes,
        content = node.content,
        last = childNodes && childNodes[0];

    // 获取模板内容
    if (node.nodeName === 'template'){
        return parse5.serialize(content);
    }

    if (!last || last.nodeName !== '#text') {
        return '';
    }
    return last.value;
};