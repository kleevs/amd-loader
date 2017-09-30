var AMDLoader;
(function (AMDLoader) {
    AMDLoader.baseUrl = ".";
    AMDLoader.paths = {};
    let modules = {};
    let current;
    function map(array, parse) {
        let res = [];
        array.forEach((x) => { var y = parse(x); y !== undefined && res.push(y); });
        return res;
    }
    function clean(array) {
        return map(array, x => x || undefined);
    }
    function cleanUri(uri) {
        return uri && clean(uri.split("/")).join("/");
    }
    function getUrl(uri) {
        return new URL([AMDLoader.baseUrl, uri].join("/"), location.href).href.replace(location.origin, "");
    }
    function getName(uri) {
        if (AMDLoader.paths) {
            for (var key in AMDLoader.paths) {
                if (uri.indexOf(key + "/") === 0) {
                    return map((AMDLoader.paths[key] + "/" + uri).replace(/\\/gi, "/").split("/"), x => x).join("/");
                }
            }
        }
        return cleanUri(uri);
    }
    function create(name) {
        var script = document.createElement('script'), url = getUrl(name);
        if (modules[name])
            return new Promise(resolve => resolve(get(name)));
        script.async = true;
        script.src = name + ".js";
        script.setAttribute("data-name", name);
        modules[name] = script;
        window.document.head.appendChild(script);
        return new Promise(resolve => {
            script.onload = script.onreadystatechange = () => {
                current && current.promise && current.promise.then((value) => {
                    script.module = value;
                    resolve(value);
                });
                (!current || !current.promise) && resolve();
                var tmp = name.split("/");
                tmp[tmp.length - 1] = "";
                current.launch(tmp.join("/"));
            };
        });
    }
    function load(uris, callback) {
        let array = [], exports, launch, promise = new Promise((resolve, reject) => {
            launch = resolve;
        });
        current = {
            launch: (baseUrl) => {
                launch && launch({ uris: uris, baseUrl: baseUrl });
            }
        };
        current.promise = promise.then((data) => {
            let array = [], getAbsoluteUrl = (name) => {
                var isRelative = name.indexOf(".") === 0 ? true : false;
                if (isRelative) {
                    var tmp = name.split("/");
                    tmp[0] = data.baseUrl;
                    name = tmp.join("/");
                }
                return cleanUri(name);
            }, require = (name) => {
                return get(getAbsoluteUrl(name));
            }, exports;
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
    AMDLoader.load = load;
    function get(name) {
        name = getName(name);
        return modules[name] ? modules[name].module : (create(name), undefined);
    }
    AMDLoader.get = get;
    window.define = load;
    window.define.amd = true;
    window.require = get;
    window.require.paths = AMDLoader.paths;
})(AMDLoader || (AMDLoader = {}));
(function (factory) {
    var define = window.define;
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined)
            module.exports = v;
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
    window.AMDLoader = undefined;
});
//# sourceMappingURL=index.js.map