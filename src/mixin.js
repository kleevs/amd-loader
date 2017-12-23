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
    function normalizePath(paths, path, uri) {
        var array = (path || "").replace(/\\/gi, "/").split("/");
        var i;
        uri = uri.replace(/\\/gi, "/");
        for (i in paths) {
            if (uri.indexOf(`${i}/`) === 0) {
                return uri.replace(i, paths[i]);
            }
        }
        for (i = 0; i < array.length; i++) {
            if (!array[i] && i > 0)
                array.splice(i, 1) && i--;
            else if (array[i] === ".")
                array.splice(i, 1) && i--;
            else if (array[i] === ".." && i > 0 && array[i - 1] !== ".." && array[i - 1])
                array.splice(i - 1, 2) && (i -= 2);
        }
        return array.join("/");
    }
    exports.normalizePath = normalizePath;
    function map(array, parse) {
        let res = [];
        array.forEach((x, i) => { var y = parse(x, i); y !== undefined && res.push(y); });
        return res;
    }
    exports.map = map;
});
