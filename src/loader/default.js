(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./abstract", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const abstract_1 = require("./abstract");
    const fs = require("fs");
    class DefaultLoader extends abstract_1.Loader {
        constructor(_config) {
            super();
            this._config = _config;
        }
        load(id) {
            var ignore = this.ignore(id);
            var content = (!ignore || ignore instanceof Function) && fs.readFileSync(id).toString() || '';
            return typeof (ignore) === "string" && ignore || (ignore && ignore instanceof Function && ignore(content)) || content;
        }
        ignore(uri) {
            var config = this._config || {};
            var ignore;
            config && config.ignore && config.ignore.some(path => {
                if (uri.match(path.test)) {
                    ignore = `define([], ${path.result});`;
                    return true;
                }
            });
            return ignore;
        }
    }
    exports.DefaultLoader = DefaultLoader;
});
