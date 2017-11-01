(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./deux", "./sub/un"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const deux_1 = require("./deux");
    const un_1 = require("./sub/un");
    function untest() {
        console.log("test " + deux_1.objtestdeux + " " + un_1.sub());
    }
    exports.untest = untest;
});
//# sourceMappingURL=un.js.map