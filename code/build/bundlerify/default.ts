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
		return `(function(def, req) {
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
	
${ this.apply(main).map(m => m.content).filter(m => !!m).join("\r\n") }

define('export', [${JSON.stringify(main.id.replace(/.js$/, ''))}], function(module) { 
	def([], function () { return module; });
});
})(typeof define !== 'undefined' && define, typeof require !== 'undefined' && require)
`;
	}
}
