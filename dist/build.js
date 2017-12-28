(function template(factory, root) {
        if (typeof module === "object" && typeof module.exports === "object") {
            var v = factory(require);
            if (v !== undefined)
                module.exports = v;
        }
        else if (typeof define === "function" && define.amd) {
            define(["require"], (require) => factory(require));
        }
        else {
            factory(null, root);
        }
    })(function anonymous(req
/**/) {
class Resolver {
        constructor(paths = {}) {
            this.paths = paths;
        }
        resolve(path, uri) {
            var paths = this.paths;
            path = (path ? [path] : []).concat([uri]).join("/");
            var array = (path || "").replace(/\\/gi, "/").split("/");
            var i;
            uri = uri.replace(/\\/gi, "/");
            for (i in paths) {
                if (uri.indexOf(`${i}/`) === 0) {
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
    }
var resolver = new Resolver({});
var names = ["src/mixin","src/resolver","src/downloader","src/downloader.node","src/build"]
var res = [{},{},{},{},{}];
var require = function(currentPath, name) { var n = resolver.resolve(currentPath, name); return names.indexOf(n) >= 0 && res[names.indexOf(n)] || req(name); }
res[0] = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function map(array, parse) {
        let res = [];
        array.forEach((x, i) => { var y = parse(x, i); y !== undefined && res.push(y); });
        return res;
    }
    exports.map = map;
})(require.bind(null, "src/"),res[0]) || res[0];
res[1] = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Resolver {
        constructor(paths = {}) {
            this.paths = paths;
        }
        resolve(path, uri) {
            var paths = this.paths;
            path = (path ? [path] : []).concat([uri]).join("/");
            var array = (path || "").replace(/\\/gi, "/").split("/");
            var i;
            uri = uri.replace(/\\/gi, "/");
            for (i in paths) {
                if (uri.indexOf(`${i}/`) === 0) {
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
    }
    exports.Resolver = Resolver;
})(require.bind(null, "src/"),res[1]) || res[1];
res[2] = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mixin_1 = require("./mixin");
    const resolver_1 = require("./resolver");
    class Downloader {
        constructor(config = {}) {
            this.config = config;
            this.modules = {};
            this.resolver = new resolver_1.Resolver(config);
        }
        get last() { return this.current; }
        normalizePath(path, uri) {
            return this.resolver.resolve(path, uri);
        }
        register(url) {
            var modules = this.modules, module = modules[url], promise;
            if (module) {
                return promise = module;
            }
            else {
                promise = this.download(url);
                return module = modules[url] = promise.then((current) => {
                    var tmp = url.split("/");
                    tmp[tmp.length - 1] = "";
                    return new Promise(resolve => {
                        current && current({
                            url: url,
                            baseUrl: tmp.join("/"),
                            setModule: (m) => resolve(m)
                        });
                    });
                });
            }
        }
        define(uris, callback) {
            if (arguments.length >= 3) {
                uris = arguments[1];
            }
            else if (arguments.length <= 1) {
                uris = [];
            }
            new Promise((resolve, reject) => {
                this.current = resolve;
            }).then((data) => {
                var baseUrl = data.baseUrl, setModule = data.setModule, exports = {};
                Promise.all(mixin_1.map(uris, (uri) => {
                    return uri === "exports" && exports ||
                        uri === "require" && "require" ||
                        this.register(this.normalizePath(baseUrl, uri));
                })).then((results) => {
                    setModule && setModule({ uri: data.url, module: callback, dependencies: results, uris: uris });
                });
            });
        }
        resolve(uri) {
            if (this.modules[uri]) {
                return this.modules[uri];
            }
            return new Promise((resolve) => {
                this.define([uri], () => { });
                this.current && this.current({ baseUrl: "", setModule: (m) => resolve(m.dependencies[0]) });
            });
        }
    }
    exports.Downloader = Downloader;
})(require.bind(null, "src/"),res[2],res[0],res[1]) || res[2];
res[3] = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const downloader_1 = require("./downloader");
    class NodeDownloader extends downloader_1.Downloader {
        constructor(paths = {}, ignores = {}) {
            super(paths);
            this.ignores = ignores;
        }
        download(url) {
            var me = this;
            var fs = require('fs');
            var fileContent = fs.readFileSync(`${url}.js`).toString();
            var define = function () { me.define.apply(me, arguments); };
            define.amd = true;
            var last;
            if (!this.ignores || !this.ignores[url]) {
                try {
                    (new Function("define", fileContent))(define);
                }
                catch (e) {
                    console.error(`Error in file ${url}.`);
                    throw e;
                }
                last = this.last;
            }
            else {
                last = (data) => {
                    data.setModule && data.setModule({ uri: data.url, module: new Function(`return ${this.ignores[url]};`), dependencies: [], uris: [] });
                };
            }
            return new Promise(resolve => {
                resolve((arg) => {
                    last(arg);
                });
            });
        }
    }
    exports.NodeDownloader = NodeDownloader;
})(require.bind(null, "src/"),res[3],res[2]) || res[3];
return res[4] = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const downloader_node_1 = require("./downloader.node");
    const resolver_1 = require("./resolver");
    const mixin_1 = require("./mixin");
    function template(factory, root) {
        if (typeof module === "object" && typeof module.exports === "object") {
            var v = factory(require);
            if (v !== undefined)
                module.exports = v;
        }
        else if (typeof define === "function" && define.amd) {
            define(["require"], (require) => factory(require));
        }
        else {
            factory(null, root);
        }
    }
    function unique(array) {
        var res = [];
        array.forEach(m => res.indexOf(m) < 0 ? res.push(m) : "");
        return res;
    }
    function extract(module) {
        var modules = [];
        module && module.dependencies && module.dependencies.forEach((m) => {
            modules = unique(modules.concat(extract(m)));
        });
        module && module.module && modules.indexOf(module) < 0 && modules.push(module);
        return modules;
    }
    function build(uri, config) {
        let resolver = new downloader_node_1.NodeDownloader(config && config.paths || {}, config && config.ignores || {});
        return resolver.resolve(uri).then((value) => {
            var modules = extract(value);
            var factory = new Function("req", `${[
                resolver_1.Resolver.toString(),
                `var resolver = new Resolver(${config && config.paths && JSON.stringify(config.paths) || "{}"});`,
                `var names = [${mixin_1.map(modules, (m) => `"${m.uri}"`)}]`,
                `var res = [${Array.apply(null, Array(modules.length)).map(() => "{}").join(",")}];`,
                `var require = function(currentPath, name) { var n = resolver.resolve(currentPath, name); return names.indexOf(n) >= 0 && res[names.indexOf(n)] || req(name); }`
            ].concat(mixin_1.map(modules, (m, idx) => {
                return m.dependencies && `${modules.length - 1 === idx && "return " || ""}res[${idx}] = (${modules[idx].module.toString()})(${mixin_1.map(m.dependencies, (d, indexd) => {
                    var i = modules.indexOf(d);
                    if (i >= 0) {
                        return `res[${i}]`;
                    }
                    else if (m.uris[indexd] == "require") {
                        var tmp = m.uri.split("/");
                        tmp[tmp.length - 1] = "";
                        return `require.bind(null, "${tmp.join("/")}")`;
                    }
                    else if (m.uris[indexd] == "exports") {
                        return `res[${idx}]`;
                    }
                })}) || res[${idx}];`;
            })).join("\r\n")}`);
            return `(${template.toString()})(${[
                factory.toString(),
                `typeof window !== 'undefined' && (window${config && config && config.name && ("." + config.name + " = {}") || ""}) || {}`
            ].join(", ")})`;
        });
    }
    exports.build = build;
})(require.bind(null, "src/"),res[4],res[3],res[1],res[0]) || res[4];
}, typeof window !== 'undefined' && (window) || {})