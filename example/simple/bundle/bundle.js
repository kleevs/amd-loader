(function() {
var __REQUIRE__ = {};
var __MODE__ = typeof __META__ !== "undefined" && (__META__.MODE === "AMD" && "AMD" || __META__.MODE === "NODE" && "NODE") || undefined;
var __META__ = {}; 
__META__.MODE = __MODE__;
__MODE__ = undefined;
(function (factory, context) {
	if (__META__.MODE === "NODE" || typeof module === "object" && typeof module.exports === "object") {
		__META__.MODE = "NODE";
		module.exports = factory(context);
	} else if (__META__.MODE === "AMD" || typeof define === "function" && define.amd) {
		__META__.MODE = "AMD";
		var moduleRequired = __REQUIRE__ = {};
		var required = [];
		define([], function () { 
			Array.prototype.forEach.call(arguments, function(res, i) {
				moduleRequired[required[i]] = res;
			}); 
			
			return factory(context); 
		});
	} else {
		__META__.MODE = "";
		var m = factory(context);
		window.test = m;
	}

})(function (context) {
	var throw_exception = function (msg) { throw msg; };
	
	__REQUIRE__ = undefined;
	throw_exception = undefined;
	context = undefined;
	var define = (function() {
		var paths = [];
		var modules = {};
		var normalize = function (path) {
			var tmp = path.split("/");
			var i = 0;
			var last = -1;
			while (i <tmp.length) {
				if (tmp[i] === "..") {
					tmp[i] = ".";
					last > 0 && (tmp[last] = ".");
					last-=2;
				} else if (tmp[i] === ".") {
					last--;
				}
				last++;
				i++;
			}

			return tmp.filter(_ => _ !== ".").join("/");
		}
		var getUri = function(uri, context) {
			paths.some(path => {
				if (uri.match(path.test)) {
					uri = uri.replace(path.test, path.result);
					return true;
				}
			});
			var href = (uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;
			href = href.replace(/^\/?(.*)$/, '/$1.js');
			href = href.replace(/\\/gi, "/");
			href = normalize(href);
			return href.replace(/^\//, '');
		}

		var define = function (id, dependencies, factory) {
			return modules[id] = factory.apply(null, dependencies.map(function (d) { 
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
		define.amd = {};
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
	    if (typeof __META__ !== "undefined" && __META__) {
	        if (__META__.MODE === "AMD") {
	            console.log("is amd");
	        }
	        else if (__META__.MODE === "NODE") {
	            console.log("is node");
	        }
	        else {
	            console.log("is script");
	        }
	    }
	    console.log("chargement de la lib en cours.");
	    var tmp = new test_1.Test();
	    var tmp2 = new test_2.Test();
	    function maLib() {
	        return "ma lib";
	    }
	    exports.maLib = maLib;
	});
	

	return define('export', ["example/simple/index"], function(m) { 
		return m;
	});
}, typeof window !== "undefined" && window || {});
})()
