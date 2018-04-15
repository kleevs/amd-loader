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
		var required = this._config && this._config.require && Object.keys(this._config.require) || [];
		return `(function() {
var __REQUIRE__ = {};
var __MODE__ = typeof __META__ !== "undefined" && (__META__.MODE === "AMD" && "AMD" || __META__.MODE === "NODE" && "NODE") || undefined;
var __META__ = ${this._config && JSON.stringify(this._config.__META__) || '{}'}; 
__META__.MODE = __MODE__;
__MODE__ = undefined;
(function (factory, context) {
	if (__META__.MODE === "NODE" || typeof module === "object" && typeof module.exports === "object") {
		__META__.MODE = "NODE";
		module.exports = factory(context);
	} else if (__META__.MODE === "AMD" || typeof define === "function" && define.amd) {
		__META__.MODE = "AMD";
		var moduleRequired = __REQUIRE__ = {};
		var required = [${required.map(function (item) { return `'${item}'`; })}];
		define([${required.map(function(k) { return `'/${me._config.require[k].id}'`; })}], function () { 
			Array.prototype.forEach.call(arguments, function(res, i) {
				moduleRequired[required[i]] = res;
			}); 
			
			return factory(context); 
		});
	} else {
		__META__.MODE = "";
		var m = factory(context);
		${this._config && this._config.name && ("window." + this._config.name + " = m;") || ""}
	}

})(function (context) {
	var throw_exception = function (msg) { throw msg; };
	${required.map(i => `var ${i} = typeof(context['${i}']) !== "undedined" && context['${i}'] || __REQUIRE__['${i}'] || throw_exception("${i} is required.");`).join("\n").replace(/\n/gim, "\n\t")}
	__REQUIRE__ = undefined;
	throw_exception = undefined;
	context = undefined;
	var define = (function() {
		var paths = [${this._config && this._config.path && this._config.path.map((item) => { return `{ test: /${item.test.source}/, result: ${JSON.stringify(item.result)} }`; }) || ''}];
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
			var href = (uri && !uri.match(/^\\//) && context && context.replace(/(\\/?)[^\\/]*$/, '$1') || '') + uri;
			href = href.replace(/^\\/?(.*)$/, '/$1.js');
			href = href.replace(/\\\\/gi, "/");
			href = normalize(href);
			return href.replace(/^\\//, '');
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

	${ this.apply(main).map(m => m.content).filter(m => !!m).join("\r\n").replace(/\n/gim, "\n\t") }

	return define('export', [${JSON.stringify(main.id.replace(/.js$/, ''))}], function(m) { 
		return m;
	});
}, typeof window !== "undefined" && window || {});
})()
`.replace(/\\t/gi, "\s\s\s\s");
	}
}
