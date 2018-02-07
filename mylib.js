(function (factory, downloadNodeJs, downloadWeb, build) {
    var context = typeof window !== 'undefined' && window ? window : {};
    var define = context.define;
    if (typeof process !== 'undefined' && process && process.argv[1] === __filename) {
        var tmp;
        var index = 0;
        var fs = require('fs');
        var configString = fs.readFileSync(process.argv[2]).toString();
        var conf = JSON.parse(configString);
        factory(downloadNodeJs, function (callback, results, exports, uris, extra) { return new Object({ index: index++, callback: callback, extra: extra, dependsOn: { uris: uris, modules: results } }); }, null, tmp = {});
        tmp.require.paths = conf.paths || {};
        tmp.require.ignores = conf.ignores || {};
        tmp.require(conf.main, null, function () {
            var content = build(tmp.require.modules, conf.name);
            fs.writeFileSync(conf.out, content);
            process.exit(0);
        });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(downloadNodeJs, function (callback, results, exports) { return callback && callback instanceof Function && (callback.apply(null, results) || exports); }, require, exports);
        if (v !== undefined)
            module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory.bind(null, downloadWeb));
    }
    else {
        factory(downloadWeb, function (callback, results, exports) { return callback && callback instanceof Function && (callback.apply(null, results) || exports); }, null, context);
    }
})(function (downloadNative, createModule, req, exports) {
    "use strict";
    var context = typeof window !== 'undefined' && window ? window : {};
    exports !== context && Object.defineProperty(exports, "__esModule", { value: true });
    var paths = {};
    var ignores = {};
    var modules = {};
    var current;
    function normalizePath(path, uri) {
        var array = (path || "").replace(/\\/gi, "/").split("/");
        var i;
        uri = uri.replace(/\\/gi, "/");
        for (i in paths) {
            if (uri.indexOf(i + "/") === 0) {
                return uri.replace(i, paths[i]);
            }
        }
        for (i = 0; i < array.length; i++) {
            if (!array[i] && i > 0)
                array.splice(i, 1) && i--;
            else if (array[i] === ".")
                array.splice(i, 1) && i--;
            else if (array[i] === ".." && i > 0 && array[i - 1] !== ".." && array[i - 1])
                array.splice(i - 1, 2) && (i -= 2);
        }
        return array.join("/");
    }
    function map(array, parse) {
        var res = [];
        array.forEach(function (x, i) { var y = parse(x, i); y !== undefined && res.push(y); });
        return res;
    }
    function download(url) {
        var module = modules[url], promise;
        if (module) {
            return promise = new Promise(function (resolve) { return module.promise.then(function (m) { return resolve(m); }); });
        }
        else {
            module = modules[url] = {};
            if (ignores[url]) {
                var callback = new Function("return " + ignores[url] + ";");
                var v = {};
                return module.promise = new Promise(function (resolve) { return resolve(module.value = createModule(callback, [], v, [], {}) || v); });
            }
            else {
                promise = downloadNative(url, exports);
                return module.promise = promise.then(function (current) {
                    var tmp = url.split("/");
                    tmp[tmp.length - 1] = "";
                    return new Promise(function (resolve) {
                        current && current({
                            baseUrl: tmp.join("/"),
                            setModule: function (m) { return resolve(module.value = m); }
                        });
                    });
                });
            }
        }
    }
    function define(uris, callback) {
        if (arguments.length >= 3) {
            uris = arguments[1];
            callback = arguments[2];
        }
        new Promise(function (resolve, reject) {
            current = resolve;
        }).then(function (data) {
            var baseUrl = data.baseUrl, setModule = data.setModule, exports = {}, concat = function (base, str) {
                return (base ? [base] : []).concat([str]).join("/");
            }, req = function (uri) { return require(normalizePath(concat(baseUrl, uri), uri)); };
            Promise.all(map(uris, function (uri) {
                return uri === "exports" && exports ||
                    uri === "require" && req ||
                    download(normalizePath(concat(baseUrl, uri), uri));
            })).then(function (results) {
                var module = createModule(callback, results, exports, uris, data.extra);
                setModule && setModule(module);
            });
        });
    }
    function require(uri, callback, finaly) {
        if ((callback || finaly) && modules[uri]) {
            setTimeout(function () { return callback(modules[uri].value); }, finaly && finaly(modules[uri].value));
            return modules[uri].value;
        }
        return modules[uri] ? modules[uri].value : (setTimeout(function () {
            define([uri], callback);
            current && current({ baseUrl: "", setModule: finaly });
        }), undefined);
    }
    Object.defineProperty(define, "amd", { value: true });
    Object.defineProperty(require, "paths", {
        get: function () { return paths; },
        set: function (value) { return paths = value || {}; }
    });
    Object.defineProperty(require, "ignores", {
        get: function () { return ignores; },
        set: function (value) { return ignores = value || {}; }
    });
    Object.defineProperty(exports, "last-defined", {
        get: function () { return current; }
    });
    exports.define = define;
    exports.require = require;
    Object.defineProperty(require, "modules", {
        get: function () { return modules; }
    });
}, function (url, amdLoader) {
    var fs = require('fs');
    var fileContent = fs.readFileSync(url + ".js").toString();
    (new Function("define", fileContent))(amdLoader.define);
    var current = amdLoader["last-defined"];
    return new Promise(function (resolve) {
        resolve(function (arg) {
            current(arg);
        });
    });
}, function (url, amdLoader) {
    var script = document.createElement('script');
    script.async = true;
    script.src = url + ".js";
    document.head.appendChild(script);
    return new Promise(function (resolve) {
        script.onload = script.onreadystatechange = function () {
            var current = amdLoader["last-defined"];
            resolve(current);
        };
    });
}, function (modules, libname) {
    var sorted = [], array = [], codes = [], i, j;
    for (i in modules) {
        var v = modules[i].value;
        sorted.push(v);
    }
    sorted.sort(function (a, b) {
        if (a.index < b.index)
            return -1;
        if (a.index > b.index)
            return 1;
        return 0;
    });
    for (i = 0; i < sorted.length; i++) {
        var str = sorted[i].callback.toString();
        var requireParameterName;
        var args = [];
        sorted[i].name = "mod_" + (i + 1);
        for (j = 0; j < sorted[i].dependsOn.uris.length; j++) {
            if (sorted[i].dependsOn.uris[j] === "require") {
                var res = (/\bfunction\b\s*\w*\s*\(([^\)]*)\)/gi).exec(str);
                var params = res && res[1] || "";
                requireParameterName = (params.split(",")[j] || "").replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            }
        }
        for (j = 0; j < sorted[i].dependsOn.uris.length; j++) {
            var uri = sorted[i].dependsOn.uris[j].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            if (requireParameterName && uri !== "exports" && uri !== "require") {
                var argname = sorted[i].dependsOn.modules[j].name;
                var regexp = new RegExp("\\b" + requireParameterName + "\\b\\s*\\(\\s*\"" + uri + "\"\\s*\\)", "gi");
                str = str.replace(regexp, requireParameterName + "(\"" + argname + "\")");
                args.push("req(\"" + argname + "\")");
            }
            else if (uri === "require") {
                args.push("req");
            }
            else if (uri === "exports") {
                args.push(i + 1 === sorted.length ? "exports" : sorted[i].name + " = {}");
            }
        }
        array.push(str);
        codes.push("var " + sorted[i].name + "; define('" + sorted[i].name + "', modules[" + i + "](" + args.join(", ") + ") || " + sorted[i].name + ");");
    }
    return "(function (factory) {\r\n\tvar modules = Array.prototype.slice.call(arguments, 1);\r\n\tvar req = function(id) { return modules[id] || require && require.apply(this, arguments); };\r\n    var def = function(id, module) { \r\n\t\tmodules[id] = module; \r\n\t};\r\n\t\r\n    if (typeof module === \"object\" && typeof module.exports === \"object\") {\r\n        var v = factory(def, req, modules, require, exports);\r\n        if (v !== undefined) module.exports = v;\r\n    }\r\n    else if (typeof define === \"function\" && define.amd) {\r\n        define([\"require\", \"exports\"], factory.bind(def, req, modules));\r\n    } \r\n\telse {\r\n\t\twindow." + libname + " = factory(def, req, modules, null, window." + libname + " = {}) || window." + libname + ";\r\n\t}\r\n})(function (define, req, modules, require, exports) {\r\n    \"use strict\";\r\n    Object.defineProperty(exports, \"__esModule\", { value: true });\r\n\t" + codes.join("\r\n    ") + "\r\n}, " + array.join(", ") + ")";
});
