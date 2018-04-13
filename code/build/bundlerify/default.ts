import { Bundlerify, Module } from './abstract';

export class DefaultBundlerify extends Bundlerify {
    constructor(private _config: any) {
        super();
    }
	
	apply(module: Module) {
		var res: { id: string; content: string }[] = [];
		module.dependencies && module.dependencies.forEach(dep => { 
			!dep.written && (dep.written = true) && this.apply(dep).forEach(m => res.push(m)); 
		});
		res.push({ id: module.id, content: module.content });
		return res;
	}

	bundle(main: Module): string {
		var me = this;
		var required = this._config && this._config.require && Object.keys(this._config.require);
		return `(function() {
var __META__ = ${this._config && JSON.stringify(this._config.__META__) || '{}'}; 
(function (factory) {
	if (typeof module === "object" && typeof module.exports === "object") {
		__META__.MODE = "NODE";
		module.exports = factory();
	} else if (typeof define === "function" && define.amd) {
		__META__.MODE = "AMD";
		var moduleRequired = __META__.REQUIRE = {};
		var required = [${required.map(function (item) { return `'${item}'`; }) || ''}];
		define([${required && required.map(function(k) { return me._config.require[k]; }) || ''}], function () { 
			arguments.forEach(function(res, i) {
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

	${ this.apply(main).map(m => m.content).filter(m => !!m).join("\r\n").replace(/\n/gim, "\n\t").replace(/\\t/gi, "\s\s\s\s") }

	return define('export', [${JSON.stringify(main.id.replace(/.js$/, ''))}], function(m) { 
		return m;
	});
});
})()
`;
	}
}
