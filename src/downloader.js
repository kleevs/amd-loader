(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./mixin", "./resolver"], factory);
    }
})(function (require, exports) {
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
});
