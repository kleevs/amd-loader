(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./resolver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const resolver_1 = require("./resolver");
    class NodeResolver extends resolver_1.Resolver {
        download(url) {
            var me = this;
            var fs = require('fs');
            var fileContent = fs.readFileSync(`${url}.js`).toString();
            var define = function () { me.define.apply(me, arguments); };
            define.amd = true;
            (new Function("define", fileContent))(define);
            return new Promise(resolve => {
                resolve((arg) => {
                    this.last(arg);
                });
            });
        }
    }
    exports.NodeResolver = NodeResolver;
});
