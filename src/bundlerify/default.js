(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./abstract"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const abstract_1 = require("./abstract");
    class DefaultBundlerify extends abstract_1.Bundlerify {
        constructor(_config) {
            super();
            this._config = _config;
        }
        apply(module) {
            var res = [];
            module.dependencies && module.dependencies.forEach(dep => {
                !dep.written && (dep.written = true) && this.apply(dep).forEach(m => res.push(m));
            });
            res.push({ id: module.id, content: module.content });
            return res;
        }
        bundle(main) {
            var me = this;
            var required = this._config && this._config.require && Object.keys(this._config.require) || [];
            return `(function() {
var __MODE__ = typeof __META__ !== "undefined" && (__META__.MODE === "AMD" && "AMD" || __META__.MODE === "NODE" && "NODE") || undefined;
var __META__ = ${this._config && JSON.stringify(this._config.__META__) || '{}'}; 
__META__.MODE = __MODE__;
__MODE__ = undefined;
(function (factory) {
	if (__META__.MODE === "NODE" || typeof module === "object" && typeof module.exports === "object") {
		__META__.MODE = "NODE";
		module.exports = factory();
	} else if (__META__.MODE === "AMD" || typeof define === "function" && define.amd) {
		__META__.MODE = "AMD";
		var moduleRequired = __META__.REQUIRE = {};
		var required = [${required.map(function (item) { return `'${item}'`; })}];
		define([${required.map(function (k) { return `'${me._config.require[k]}`; })}], function () { 
			Array.prototype.forEach.call(arguments, function(res, i) {
				moduleRequired[required[i]] = res;
			}); 
			
			return factory(); 
		});
	} else {
		__META__.MODE = "";
		var m = factory();
		${this._config && this._config.name && ("window." + this._config.name + " = m;") || ""}
	}

})(function () {
	var define = (function() {
		var paths = [${this._config && this._config.path && this._config.path.map((item) => { return `{ test: /${item.test.source}/, result: ${JSON.stringify(item.result)} }`; }) || ''}];
		var modules = {};
		var getUri = function(uri, context) {
			var link = document.createElement("a");
			paths.some(path => {
				if (uri.match(path.test)) {
					uri = uri.replace(path.test, path.result);
					return true;
				}
			});
			var href = (uri && !uri.match(/^\\//) && context && context.replace(/(\\/?)[^\\/]*$/, '$1') || '') + uri;
			var res = href.replace(/^\\/?(.*)$/, '/$1.js');
			link.href = res.replace(/\\\\/gi, "/");
			return link.pathname.replace(/^\\//, '');
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

	${this.apply(main).map(m => m.content).filter(m => !!m).join("\r\n").replace(/\n/gim, "\n\t").replace(/\\t/gi, "\s\s\s\s")}

	return define('export', [${JSON.stringify(main.id.replace(/.js$/, ''))}], function(m) { 
		return m;
	});
});
})()
`;
        }
    }
    exports.DefaultBundlerify = DefaultBundlerify;
});
