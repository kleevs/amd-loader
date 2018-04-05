(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./abstract", "fs", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const abstract_1 = require("./abstract");
    const fs = require("fs");
    const path = require("path");
    class DefaultLoader extends abstract_1.Loader {
        constructor(_config) {
            super();
            this._config = _config;
            this._tab = 0;
            this._ignoreModules = [];
            this.getAbsoluteUri = (uri, context) => {
                var config = this._config || {};
                var ignore;
                if (config) {
                    config.path && config.path.some(path => {
                        if (uri.match(path.test)) {
                            uri = uri.replace(path.test, path.result);
                            return true;
                        }
                    });
                }
                var href = (uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;
                var res = href.replace(/^(.*)$/, '$1.js');
                return path.normalize(res).replace(/\\/gi, "/").replace(/^\/?(.*)/gi, "$1");
            };
            this.ignore = (uri) => {
                var config = this._config || {};
                var ignore;
                config && config.ignore && config.ignore.some(path => {
                    if (uri.match(path.test)) {
                        ignore = path.result;
                        return true;
                    }
                });
                return ignore;
            };
        }
        getLocalDependencies(id, content) {
            var regex = /define\s*\([^,]*,?\s*(\[(\s*"[^"]*",?\s*)*\])/gi;
            var res = content && regex.exec(content) || undefined;
            res = res && res[1];
            res = res && new Function(`return ${res};`)();
            res = res && res.filter((s) => s !== "require" && s !== "exports");
            res = res || [];
            return res;
        }
        match(id) { return true; }
        load(id) {
            var content, dependencies;
            if (id !== "0-core-define") {
                content = fs.readFileSync(id).toString().replace(/define\(/, `define('${id}', `);
                var local = this.getLocalDependencies(id, content);
                this._ignoreModules = this._ignoreModules.concat(local.map((d) => {
                    var res = this.ignore(d);
                    res = res && { id: d, content: res };
                    return res;
                })
                    .filter(mod => !!mod));
                dependencies = local.filter(d => !this.ignore(d)).map(dependency => this.getAbsoluteUri(dependency, id));
                console.log(`${id} => [${dependencies.join(', ')}]`);
                dependencies.push("0-core-define");
            }
            else {
                content = `
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
        var res = href.replace(/^(.*)$/, '$1.js');
        link.href = res.replace(/\\\\/gi, "/");
		return link.href;
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
	${this._ignoreModules.map(m => {
                    return `define("${m.id}", [], ${m.content});`;
                }).join("\n")}
    return define; 
})();
`;
                dependencies = [];
            }
            return {
                content: content,
                dependencies: dependencies
            };
        }
    }
    exports.DefaultLoader = DefaultLoader;
});
