(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./base/base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const base_1 = require("./base/base");
    class Test extends base_1.Base {
        constructor() {
            super();
            console.log("tool construit");
        }
    }
    exports.Test = Test;
});
//# sourceMappingURL=test.js.map