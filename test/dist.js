(function template(factory, root) {
        if (typeof module === "object" && typeof module.exports === "object") {
            var v = factory(require);
            if (v !== undefined)
                module.exports = v;
        }
        else if (typeof define === "function" && define.amd) {
            define(["require"], (require) => factory(require));
        }
    })(function anonymous(req
/**/) {
class Resolver {
        constructor(paths = {}) {
            this.paths = paths;
        }
        resolve(path, uri) {
            var paths = this.paths;
            path = (path ? [path] : []).concat([uri]).join("/");
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
    }
var resolver = new Resolver();
var names = ["modules/base/base","modules/sub","modules/index"]
var res = [{},{},{}];
var require = function(currentPath, name) { name = resolver.resolve(currentPath, name); return names.indexOf(name) >= 0 && res[names.indexOf(name)] || req(name); }
res[0] = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function base() {
        console.log("base");
    }
    exports.base = base;
})(require.bind(null, "modules/base/"),res[0]) || res[0];
res[1] = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const base_1 = require("./base/base");
    function sub() {
        console.log("sub");
        base_1.base();
    }
    exports.sub = sub;
})(require.bind(null, "modules/"),res[1],res[0]) || res[1];
return res[2] = (function (require, exports) {
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
})(require.bind(null, "modules/"),res[2],res[1],res[0]) || res[2];
}, typeof window !== 'undefined' && window || {})