(function(def, req) {
var __META__ = {}; 
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
		__META__.MODE = "NODE";
    }
    else if (typeof def === "function" && def.amd) {
		__META__.MODE = "AMD";
    } else {
		__META__.MODE = "";
	}
	
	factory();
})(function () {
	var define = (function() {
		var paths = [];
		var modules = {};
		var getUri = function(uri, context) {
			var link = document.createElement("a");
			paths.some(path => {
				if (uri.match(path.test)) {
					uri = uri.replace(path.test, path.result);
					return true;
				}
			});
			var href = (uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;
			var res = href.replace(/^\/?(.*)$/, '/$1.js');
			link.href = res.replace(/\\/gi, "/");
			return link.pathname.replace(/^\//, '');
		}
		var define = function (id, dependencies, factory) {
			modules[id] = factory.apply(null, dependencies.map(function (d) { 
				if (d !== "exports" && d !== "require") {
					return modules[getUri(d, id)]; 
				}
				
				if (d === "exports") {
					return modules[id] = {};
				}
				
				if (d === "require") {
					return function (k) { var uri = getUri(k, id); return modules[uri]; };
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


	define('export', ["example/simple/index"], function(m) { 
		if (__META__.MODE === "NODE") {
			module.exports = m;
		} else if (__META__.MODE === "AMD") {
			def([], function () { return m; });
		} else {
			window.test = m;
		}
	});
});
})(typeof define !== 'undefined' && define, typeof require !== 'undefined' && require)
