(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./test", "./tools/test"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const test_1 = require("./test");
    const test_2 = require("./tools/test");
    var tmp = new test_1.Test();
    var tmp2 = new test_2.Test();
    console.log("yes");
});
