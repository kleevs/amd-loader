(function(def, req) {

var define = (function() {
    var paths = [];
    var modules = {};
    var getUri = function(uri, context?) {
        paths.some(path => {
            if (uri.match(path.test)) {
                uri = uri.replace(path.test, path.result);
                return true;
            }
        });
        var href = (uri && !uri.match(/^//) && context && context.replace(/(/?)[^/]*$/, '$1') || '') + uri;
        var res = href.replace(/^(.*)$/, '$1.js');
        return path.normalize(res).replace(/\/gi, "/")
    }
    var define = function (id, dependencies, factory) {
        modules[id] = factory(dependencies.map(function (d) { 
            if (d !== "exports" && d !== "require") {
                return modules[getUri(d, id)]; 
            }
            
            if (d === "exports") {
                return modules[id] = {};
            }
            
            if (d === "require") {
                return function (k) { return modules[getUri(k, id)] || req(getUri(k, id)); };
            }
        })) || modules[id];
    }
    define.amd = true;
	
    return define; 
})();

define('example/simple/tools/base/base.js', ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Base {
        constructor() {
            console.log("base construit");
        }
    }
    exports.Base = Base;
});

define('example/simple/test.js', ["require", "exports", "./tools/base/base"], function (require, exports, base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Test extends base_1.Base {
        constructor() {
            super();
            console.log("objet construit");
        }
    }
    exports.Test = Test;
});

define('example/simple/tools/test.js', ["require", "exports", "./base/base"], function (require, exports, base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Test extends base_1.Base {
        constructor() {
            super();
            console.log("tool construit");
        }
    }
    exports.Test = Test;
});

define('example/simple/index.js', ["require", "exports", "./test", "./tools/test"], function (require, exports, test_1, test_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tmp = new test_1.Test();
    var tmp2 = new test_2.Test();
    console.log("yes");
});

})(typeof define !== 'undefined' && define, typeof require !== 'undefined' && require)