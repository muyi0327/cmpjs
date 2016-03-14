var util = require('./util');

/**
 * 输出最终产物
 * @param opt
 */
module.exports = function(opt){
    opt = opt||{};
    var dir = opt.dir;
    var str = fs.readFileSync(dir, 'utf8');
    var fragment = parse5.parseFragment(str);
    return util.analysisFileContent(fragment.childNodes);
}