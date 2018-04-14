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
            var moduleid = this.isRequired(id);
            var content = moduleid && `define([], function() { return ${moduleid}; });` || fs.readFileSync(id).toString() || '';
            return content;
        }
        isRequired(uri) {
            var config = this._config || {};
            var moduleid;
            config && config.require && Object.keys(config.require).some(id => {
                var path = config.require[id];
                var paths = path instanceof Array ? path : [path];
                return paths.some(path => {
                    if (uri.match(path.for)) {
                        moduleid = id;
                        return true;
                    }
                });
            });
            return moduleid;
        }
    }
    exports.DefaultLoader = DefaultLoader;
});
