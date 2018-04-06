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
    class DefaultWriter extends abstract_1.Writer {
        constructor(_config) {
            super();
            this._config = _config;
        }
        write(file, content) {
            fs.writeFileSync(file, content);
        }
    }
    exports.DefaultWriter = DefaultWriter;
});
