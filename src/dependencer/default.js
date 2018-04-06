(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./abstract", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const abstract_1 = require("./abstract");
    const path = require("path");
    class DefaultDependencer extends abstract_1.Dependencer {
        constructor(_config) {
            super();
            this._config = _config;
        }
        getDependencies(id, content) {
            var config = this._config || {};
            var regex = /define\s*\([^,]*,?\s*(\[(\s*"[^"]*",?\s*)*\])/gi;
            var res = content && regex.exec(content) || undefined;
            res = res && res[1];
            res = res && new Function(`return ${res};`)();
            res = res && res.filter((s) => s !== "require" && s !== "exports");
            res = res || [];
            res = res.map(d => {
                config && config.path && config.path.some(path => {
                    if (d.match(path.test)) {
                        d = d.replace(path.test, path.result);
                        return true;
                    }
                });
                var href = (d && !d.match(/^\//) && id && id.replace(/(\/?)[^\/]*$/, '$1') || '') + d;
                var res = href.replace(/^(.*)$/, '$1.js');
                return path.normalize(res).replace(/\\/gi, "/").replace(/^\/?(.*)/gi, "$1");
            });
            console.log(id + " => [" + res.join(", ") + "]");
            return res;
        }
    }
    exports.DefaultDependencer = DefaultDependencer;
});
