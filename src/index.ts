
(function (factory) {
	var context:any = typeof window !== 'undefined' && window ? window : {};
    var define = context.define;
	
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports, { document: {}, href: ""/*__filename*/, origin: "/", URL: class {
            constructor(private str, private origin) {}
            get href(): string { return [this.str, this.origin].join("/"); }
        }});
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    } else {
		factory(null, context);
	}
})(function (req, exports, nodejs?) {
    "use strict";
	var context:any = typeof window !== 'undefined' && window ? window : {};
    exports !== context && Object.defineProperty(exports, "__esModule", { value: true });
    var document = nodejs ? nodejs.document : context.document;
    var href = nodejs ? nodejs.href : location.href;
    var origin = nodejs ? nodejs.origin : location.origin;
    var URL = nodejs ? nodejs.URL : context.URL;

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

    function getCurrentPath() {
        return href;
    }

    function getOriginPath() {
        return origin;
    }

    function getUrl(baseUrl: string, uri: string): string {
		var cleanUriArray = clean(uri.replace(/\\/gi, "/").split("/"));
		var str = cleanUriArray[0].indexOf(".") === 0 && clean([].concat(clean(baseUrl.replace(/\\/gi, "/").split("/"))).concat(cleanUriArray)).join("/") || 
			paths && paths[cleanUriArray[0]] && (cleanUriArray[0] = paths[cleanUriArray[0]]) && cleanUriArray.join("/") || cleanUriArray.join("/");
        return new URL(str, getCurrentPath()).href.replace(getOriginPath(), "");
    }
	
	function download(url: string): Promise<any> {
		var script, module = modules[url];

        if (module) return new Promise(resolve => resolve(module.promise));
        if(nodejs) return downloadNodeJs(url); 

        script = document.createElement('script');
        module = modules[url];
        script.async = true;
        script.src = url + ".js";
        module = modules[url] = {};
		module.script = script;
        document.head.appendChild(script);
        return module.promise = new Promise(resolve => {
            script.onload = (<any>script).onreadystatechange = () => {
                var tmp = script.src.replace(getOriginPath(), "").split("/");
                tmp[tmp.length-1] = "";
				current && current({ baseUrl: tmp.join("/"), resolve: (m) => resolve(module.value = m) });
            };
        });
    }
    
    function downloadNodeJs(url: string) : Promise<any> {
        var module = modules[url];
        module = modules[url] = {};

        return new Promise((resolve) => { resolve(); });
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
				var module = callback && !nodejs && callback.apply(null, results) || exports;
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
            var tmp = getCurrentPath().replace(getOriginPath(), "").split("/");
            tmp[tmp.length-1] = "";
            define([uri], callback);
            current && current({ baseUrl: tmp.join("/"), resolve: nodejs && callback });            
        }), undefined);
    }

	Object.defineProperty(define, "amd", { value: true });
    Object.defineProperty(require, "paths",{
        get: () => paths,
        set: (value) => paths = value
    });

    exports.define = define;
    exports.require = require;
    Object.defineProperty(require, "modules",{
        get: () => modules
    });
});
