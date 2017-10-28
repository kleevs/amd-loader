
(function (factory) {
	var context:any = window;
    var define = context.define;
	
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    } else {
		factory(null, window);
	}
})(function (req, exports) {
    "use strict";
	var context:any = window;
    exports !== context && Object.defineProperty(exports, "__esModule", { value: true });

    let paths: any = {};
    let modules: any = {};
    let current: any;

    function map<T1, T2>(array: T1[], parse: (x: T1, index?: number) => T2): T2[] {
        let res = [];
        array.forEach((x, i) => { var y = parse(x, i); y !== undefined && res.push(y); });
        return res;
    }

    function clean<T>(array: T[]): T[] {
        return map(array, (x, i) => x || i <= 0 ? x : undefined);
    }

    function getUrl(baseUrl: string, uri: string): string {
		var cleanUriArray = clean(uri.replace(/\\/gi, "/").split("/"));
		var str = cleanUriArray[0].indexOf(".") === 0 && clean([].concat(clean(baseUrl.replace(/\\/gi, "/").split("/"))).concat(cleanUriArray)).join("/") || 
			paths && paths[cleanUriArray[0]] && (cleanUriArray[0] = paths[cleanUriArray[0]]) && cleanUriArray.join("/") || cleanUriArray.join("/");
        return new URL(str, location.href).href.replace(location.origin, "");
    }
	
	function download(url: string): Promise<any> {
		var script = document.createElement('script'),
            module = modules[url];

        if (module) return new Promise(resolve => resolve(module.promise));

        script.async = true;
        script.src = url + ".js";
        module = modules[url] = {};
		module.script = script;
        window.document.head.appendChild(script);
        return module.promise = new Promise(resolve => {
            script.onload = (<any>script).onreadystatechange = () => {
                var tmp = script.src.replace(location.origin, "").split("/");
                tmp[tmp.length-1] = "";
				current && current({ baseUrl: tmp.join("/"), resolve: (m) => resolve(module.value = m) });
            };
        });
	}

	function define(uris: string[], callback: Function) {
        if (arguments.length >= 3) {
            uris = arguments[1];
            callback = arguments[2];
        }

        new Promise((resolve, reject) => {
			current = resolve;
		}).then((data: {baseUrl: string, resolve: (arg) => void}) => {
			var baseUrl = data.baseUrl,
				resolve = data.resolve,
				exports = {},
				req = (uri) => require(getUrl(baseUrl, uri));
				
			Promise.all(map(uris, (uri) => {
				return uri === "exports" && exports ||
					uri === "require" && req ||
					download(getUrl(baseUrl, uri));
			})).then((results) => {
				var module = callback && callback.apply(null, results) || exports;
				resolve && resolve(module);
			});
		});
    }
	
    function require(uri: string, callback?: Function) {
        if (callback && modules[uri]) { 
            setTimeout(() => { 
				callback(undefined, undefined, modules[uri].value); 
			});
            return undefined;
        }

        return modules[uri] ? modules[uri].value : (setTimeout(() => {
            var tmp = location.href.replace(location.origin, "").split("/");
            tmp[tmp.length-1] = "";
            define([uri], callback);
            current && current({ baseUrl: tmp.join("/"), resolve: null });            
        }), undefined);
    }

	Object.defineProperty(define, "amd", { value: true });
    Object.defineProperty(require, "paths",{
        get: () => paths,
        set: (value) => paths = value
    });

    exports.define = define;
    exports.require = require;
});
