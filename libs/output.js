var util = require('./util');

/**
 * ������ղ���
 * @param opt
 */
module.exports = function(opt){
    opt = opt||{};
    var dir = opt.dir;
    var str = fs.readFileSync(dir, 'utf8');
    var fragment = parse5.parseFragment(str);
    return util.analysisFileContent(fragment.childNodes);
}