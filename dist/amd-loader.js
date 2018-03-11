
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
var names = ["src/mixin","src/resolver","src/downloader","src/downloader.web","src/index"]
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
                callback = arguments[2];
            }
            else if (arguments.length <= 1) {
                uris = [];
                callback = arguments[0];
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
    const mixin_1 = require("./mixin");
    class WebDownloader extends downloader_1.Downloader {
        constructor(conf) {
            super(conf.paths || {});
        }
        download(url) {
            var me = this;
            window.define = function () { return me.define.apply(me, arguments); };
            window.define.amd = true;
            url = url.indexOf("/") !== 0 && `/${url}` || url;
            var script = document.createElement('script');
            script.async = true;
            script.src = `${url}.js`;
            document.head.appendChild(script);
            return new Promise(resolve => {
                script.onload = script.onreadystatechange = () => {
                    var last = this.last;
                    resolve((arg) => {
                        var setModule = arg.setModule;
                        arg.setModule = (m) => {
                            m.value = m.value || m.module.apply(null, mixin_1.map(m.dependencies, (d) => {
                                return d.value || d === "require" && ((uri) => m.dependencies[m.uris.indexOf(uri)].value) || d;
                            })) || m.dependencies[m.uris.indexOf("exports")];
                            return setModule(m);
                        };
                        var res = last(arg);
                        return res;
                    });
                };
            });
        }
    }
    exports.WebDownloader = WebDownloader;
})(require.bind(null, "src/"),res[3],res[2],res[0]) || res[3];
return res[4] = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const downloader_web_1 = require("./downloader.web");
    let resolver = new downloader_web_1.WebDownloader({});
    function config(config) {
        resolver = new downloader_web_1.WebDownloader(config);
    }
    exports.config = config;
    function load(uri) {
        return resolver.resolve(uri).then(module => module.value);
    }
    window.require = load;
    window.require.config = config;
})(require.bind(null, "src/"),res[4],res[3]) || res[4];
}, typeof window !== 'undefined' && window || (window = {}) || {})