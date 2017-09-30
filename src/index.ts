module AMDLoader {
    export let baseUrl: string = ".";
    export let paths: any = {};
    let modules: any = {};
    let current: {
        launch?: (baseUrl: string) => void,
        promise?: Promise<any>
    };

    function map<T1, T2>(array: T1[], parse: (x: T1) => T2): T2[] {
        let res = [];
        array.forEach((x) => { var y = parse(x); y !== undefined && res.push(y); });
        return res;
    }

    function clean<T>(array: T[]): T[] {
        return map(array, x => x || undefined);
    }

    function cleanUri(uri: string): string {
        return uri && clean(uri.split("/")).join("/");
    }

    function getUrl(uri: string): string {
         return new URL([baseUrl, uri].join("/"), location.href).href.replace(location.origin, "");
    }
    
    function getName(uri: string): string {
        if (paths) {
            for(var key in paths) {
                if (uri.indexOf(key + "/") === 0) { 
                    return map((paths[key] + "/" + uri).replace(/\\/gi, "/").split("/"), x => x).join("/");
                }
            }
        }

        return cleanUri(uri);
   }

    function create(name: string): Promise<any> {
        var script = document.createElement('script'),
            url = getUrl(name);

        if (modules[name]) return new Promise(resolve => resolve(get(name)));

        script.async = true;
        script.src = name + ".js";
        script.setAttribute("data-name", name);
        modules[name] = script;
        window.document.head.appendChild(script);
        return new Promise(resolve => {
            script.onload = (<any>script).onreadystatechange = () => {
                current && current.promise && current.promise.then((value) => {
                    (<any>script).module = value;
                    resolve(value);
                });
                (!current || !current.promise) && resolve();

                var tmp = name.split("/");
                tmp[tmp.length-1] = "";
                current.launch(tmp.join("/"));
            };
        });
    }

    export function load(uris: string[], callback: Function) {
        let array: any[] = [],
            exports,
            launch,
            promise = new Promise((resolve, reject) => {
                launch = resolve;
            });

        current = {
            launch: (baseUrl: string) => {
                launch && launch({ uris: uris, baseUrl: baseUrl });
            }
        };

        current.promise = promise.then((data: { uris: string[], baseUrl: string }) => {
            let array: any[] = [],
                getAbsoluteUrl = (name: string) => {
                    var isRelative = name.indexOf(".") === 0 ? true : false;
                    if (isRelative) { 
                        var tmp = name.split("/");
                        tmp[0] = data.baseUrl;
                        name = tmp.join("/");
                     }

                     return cleanUri(name);
                },
                require = (name: string) => { 
                    return get(getAbsoluteUrl(name));
                },
                exports;

            data.uris.forEach((uri, index) => {
                array[index] = 
                    uri === "exports" && {} ||
                    uri === "require" && require ||
                    create(getName(getAbsoluteUrl(uri)));

                uri === "exports" && (exports = array[index]);
            });

            return Promise.all(array).then((results) => {
                var module = callback.apply(null, results) || exports;
                return module;
            });
        });
    }

    export function get(name: string) {
        name = getName(name);
        return modules[name] ? modules[name].module : (create(name), undefined);
    }

    (<any>window).define = load;
    (<any>window).define.amd = true;
    (<any>window).require = get;
    (<any>window).require.paths = paths;
}

(function (factory) {
    var define = (<any>window).define;
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    for (var i in AMDLoader) {
        exports[i] = AMDLoader[i];
    }

    (<any>window).AMDLoader = undefined;
})