(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function map(array, parse) {
        let res = [];
        array.forEach((x, i) => { var y = parse(x, i); y !== undefined && res.push(y); });
        return res;
    }
    exports.map = map;
});
