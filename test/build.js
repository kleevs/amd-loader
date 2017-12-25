(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../src/build"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const build_1 = require("../src/build");
    var fs = require('fs');
    build_1.build("./modules/index").then((value) => {
        fs.writeFileSync("dist.js", value);
    });
});
