(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './a.js'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./a.js'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.a);
        global.unknown = mod.exports;
    }
})(this, function (exports, a) {
    'use strict';

    var __template = '<article class="new-box"><dl class="new-content"><dt class="new-img"><img src="{{pic}}"alt=""></dt><dd><h2 class="new-title">{{title}}</h2><div class="new-body">{{content}}</div></dd></dl></article>';
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
    __cmp__importComponentStyle(".new-box{width:100%;min-height:240px}.new-box .new-content{display:flex}.new-box .new-content .dt{flex-basis:100px}", "NewBox");

    exports.done = function () {
        a.done();
    };
});