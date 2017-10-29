(function (factory) {
    var context = typeof window !== 'undefined' && window ? window : {};
    var define = context.define;
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports, {
            document: {},
            href: "" /*__filename*/,
            origin: "/",
            URL: class {
                constructor(str, origin) {
                    this.str = str;
                    this.origin = origin;
                }
                get href() { return [this.str].join("/"); }
            },
            nodeRequire: typeof require !== undefined && ((url) => {
                var configFile = process.argv[1].replace(/\\/gi, "/");
                var configPath = configFile.replace(/\/[^\/]+$/gi, "");
                return require(`${configPath}/${url}`);
            })
        });
        if (v !== undefined)
            module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
    else {
        factory(null, context);
    }
})(function (req, exports, nodejs) {
    "use strict";
    var context = typeof window !== 'undefined' && window ? window : {};
    exports !== context && Object.defineProperty(exports, "__esModule", { value: true });
    var document = nodejs ? nodejs.document : context.document;
    var href = nodejs ? nodejs.href : location.href;
    var origin = nodejs ? nodejs.origin : location.origin;
    var URL = nodejs ? nodejs.URL : context.URL;
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
    function getCurrentPath() {
        return href;
    }
    function getOriginPath() {
        return origin;
    }
    function getUrl(baseUrl, uri) {
        var cleanUriArray = clean(uri.replace(/\\/gi, "/").split("/"));
        var str = cleanUriArray[0].indexOf(".") === 0 && clean([].concat(clean(baseUrl.replace(/\\/gi, "/").split("/"))).concat(cleanUriArray)).join("/") ||
            paths && paths[cleanUriArray[0]] && (cleanUriArray[0] = paths[cleanUriArray[0]]) && cleanUriArray.join("/") || cleanUriArray.join("/");
        return new URL(str, getCurrentPath()).href.replace(getOriginPath(), "");
    }
    function download(url) {
        var script, module = modules[url];
        if (module)
            return new Promise(resolve => resolve(module.promise));
        if (nodejs)
            return downloadNodeJs(url);
        script = document.createElement('script');
        module = modules[url];
        script.async = true;
        script.src = url + ".js";
        module = modules[url] = {};
        module.script = script;
        document.head.appendChild(script);
        return module.promise = new Promise(resolve => {
            script.onload = script.onreadystatechange = () => {
                var tmp = script.src.replace(getOriginPath(), "").split("/");
                tmp[tmp.length - 1] = "";
                current && current({ baseUrl: tmp.join("/"), resolve: (m) => resolve(module.value = m) });
            };
        });
    }
    function downloadNodeJs(url) {
        var module = modules[url];
        module = modules[url] = {};
        return new Promise((resolve) => {
            var mod = nodejs.nodeRequire(`${url}`);
            current && current({ baseUrl: url, resolve: (m) => resolve(module.value = m) });
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
                var module = callback && !nodejs && callback.apply(null, results) || exports;
                resolve && resolve(module);
            });
        });
    }
    function require(uri, callback) {
        if (callback && modules[uri]) {
            setTimeout(() => {
                callback(undefined, undefined, modules[uri].value);
            });
            return undefined;
        }
        return modules[uri] ? modules[uri].value : (setTimeout(() => {
            var tmp = getCurrentPath().replace(getOriginPath(), "").split("/");
            tmp[tmp.length - 1] = "";
            define([uri], callback);
            current && current({ baseUrl: tmp.join("/"), resolve: nodejs && callback });
        }), undefined);
    }
    Object.defineProperty(define, "amd", { value: true });
    Object.defineProperty(require, "paths", {
        get: () => paths,
        set: (value) => paths = value
    });
    exports.define = define;
    exports.require = require;
    Object.defineProperty(require, "modules", {
        get: () => modules
    });
});
//# sourceMappingURL=index.js.map