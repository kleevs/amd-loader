var AMDLoader;
(function (AMDLoader) {
    let paths = {};
    let modules = {};
    let current;
    function map(array, parse) {
        let res = [];
        array.forEach((x, i) => { var y = parse(x, i); y !== undefined && res.push(y); });
        return res;
    }
    function clean(array) {
        return map(array, (x, i) => x || i <= 0 ? x : undefined);
    }
    function getUrl(baseUrl, uri) {
        var cleanUriArray = clean(uri.replace(/\\/gi, "/").split("/"));
        var str = cleanUriArray[0].indexOf(".") === 0 && clean([].concat(clean(baseUrl.replace(/\\/gi, "/").split("/"))).concat(cleanUriArray)).join("/") ||
            paths && paths[cleanUriArray[0]] && (cleanUriArray[0] = paths[cleanUriArray[0]]) && cleanUriArray.join("/") || cleanUriArray.join("/");
        return new URL(str, location.href).href.replace(location.origin, "");
    }
    function download(url) {
        var script = document.createElement('script'), module = modules[url];
        if (module)
            return new Promise(resolve => resolve(module.promise));
        script.async = true;
        script.src = url + ".js";
        module = modules[url] = {};
        module.script = script;
        window.document.head.appendChild(script);
        return module.promise = new Promise(resolve => {
            script.onload = script.onreadystatechange = () => {
                var tmp = script.src.replace(location.origin, "").split("/");
                tmp[tmp.length - 1] = "";
                current && current({ baseUrl: tmp.join("/"), resolve: (m) => resolve(module.value = m) });
            };
        });
    }
    function define(uris, callback) {
        if (arguments.length >= 3) {
            uris = arguments[1];
            callback = arguments[2];
        }
        new Promise((resolve, reject) => {
            current = resolve;
        }).then((data) => {
            var baseUrl = data.baseUrl, resolve = data.resolve, exports = {}, req = (uri) => require(getUrl(baseUrl, uri));
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
    AMDLoader.define = define;
    function require(uri, callback) {
        if (callback && modules[uri]) {
            setTimeout(() => {
                callback(undefined, undefined, modules[uri].value);
            });
            return undefined;
        }
        return modules[uri] ? modules[uri].value : (setTimeout(() => {
            var tmp = location.href.replace(location.origin, "").split("/");
            tmp[tmp.length - 1] = "";
            define([uri], callback);
            current && current({ baseUrl: tmp.join("/"), resolve: null });
        }), undefined);
    }
    AMDLoader.require = require;
    Object.defineProperty(define, "amd", { value: true });
    Object.defineProperty(require, "paths", {
        get: () => paths,
        set: (value) => paths = value
    });
})(AMDLoader || (AMDLoader = {}));
(function (factory) {
    var context = window;
    var define = context.define;
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined)
            module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
    else {
        factory(null, window);
    }
})(function (require, exports) {
    "use strict";
    var context = window;
    exports !== context && Object.defineProperty(exports, "__esModule", { value: true });
    for (var i in AMDLoader) {
        exports[i] = AMDLoader[i];
    }
    context.AMDLoader = undefined;
});
//# sourceMappingURL=index.js.map