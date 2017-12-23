(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "resolver.web"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const resolver_web_1 = require("resolver.web");
    let resolver = new resolver_web_1.WebResolver();
    function load(uri) {
        resolver.resolve(uri);
    }
    exports.load = load;
});
