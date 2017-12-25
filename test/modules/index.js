(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./sub", "./base/base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const sub_1 = require("./sub");
    const base_1 = require("./base/base");
    function test() {
        console.log("test");
        sub_1.sub();
        base_1.base();
    }
    exports.test = test;
    test();
});
