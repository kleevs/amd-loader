(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./abstract"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const abstract_1 = require("./abstract");
    class DefaultTranspiler extends abstract_1.Transpiler {
        constructor(_config) {
            super();
            this._config = _config;
        }
        transpile(id, content) {
            return content.replace(/define\(/, `define('${id}', `);
        }
    }
    exports.DefaultTranspiler = DefaultTranspiler;
});
