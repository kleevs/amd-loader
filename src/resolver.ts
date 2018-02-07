((factory) => {
	var context:any = typeof window !== 'undefined' && window ? window : {};
    var define = context.define;

    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory();
        if (v !== undefined) module.exports = v;
    } else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    } else {
		factory();
	}
})(() => {
    "use strict";
	var context:any = typeof window !== 'undefined' && window ? window : {};
    exports !== context && Object.defineProperty(exports, "__esModule", { value: true });

    let paths = {};
	let ignores = {};
    let modules: { [s: string]: { promise?: Promise<Function>, value?: any } } = {};
    let current: any;

    function normalizePath (path: string, uri: string) {
        var array = (path || "").replace(/\\/gi, "/").split("/");
        var i;

		uri = uri.replace(/\\/gi, "/");
		for (i in paths) {
			if (uri.indexOf(`${i}/`) === 0) {
				return uri.replace(i, paths[i]);
			}
	    }
		
        for (i=0; i<array.length; i++) {
            if (!array[i] && i > 0) array.splice(i, 1) && i--;
            else if (array[i] === ".") array.splice(i, 1) && i--;
            else if (array[i] === ".." && i > 0 && array[i-1] !== ".." && array[i-1]) array.splice(i-1, 2) && (i-=2);            
        }

        return array.join("/");
    }

    function map<T1, T2>(array: T1[], parse: (x: T1, index?: number) => T2): T2[] {
        let res = [];
        array.forEach((x, i) => { var y = parse(x, i); y !== undefined && res.push(y); });
        return res;
    }

	function download(url: string): Promise<any> {
		var module = modules[url],
			promise;

		if (module) {
			return promise = new Promise(resolve => module.promise.then((m) => resolve(m)));
		} else {
			module = modules[url] = {};
			
			if (ignores[url]) {
				var callback = new Function(`return ${ignores[url]};`);
				var v = {};
				return module.promise = new Promise(resolve => resolve(module.value = createModule(callback, [], v, [], {}) || v));
			} else {
				promise = downloadNative(url, exports);
				return module.promise = promise.then((current) => {
					var tmp = url.split("/");
					tmp[tmp.length-1] = "";

					return new Promise<any>(resolve => {
						current && current({ 
							baseUrl: tmp.join("/"), 
							setModule: (m) => resolve(module.value = m) 
						});
					});
				});
			}
		}
    }

	function define(uris: string[], callback: Function) {
        if (arguments.length >= 3) {
            uris = arguments[1];
            callback = arguments[2];
        }

        new Promise((resolve, reject) => {
			current = resolve;
		}).then((data: {baseUrl: string, setModule: (module) => void, extra: any}) => {
			var baseUrl = data.baseUrl,
                setModule = data.setModule,
                exports = {},
                concat = (base, str) => {
                    return (base ? [base] : []).concat([str]).join("/");
                },
				req = (uri) => require(normalizePath(concat(baseUrl, uri), uri));
				
			Promise.all(map(uris, (uri) => {
				return uri === "exports" && exports ||
					uri === "require" && req ||
					download(normalizePath(concat(baseUrl, uri), uri));
			})).then((results) => {
				setModule && setModule(module);
			});
		});
    }
	
    function require(uri: string, callback?: Function, finaly?: Function) {
        if ((callback || finaly) && modules[uri]) { 
            setTimeout(() => callback(modules[uri].value), finaly && finaly(modules[uri].value));
            return modules[uri].value;
        }

        return modules[uri] ? modules[uri].value : (setTimeout(() => {
            define([uri], callback);
            current && current({ baseUrl: "", setModule: finaly });            
        }), undefined);
    }
});
