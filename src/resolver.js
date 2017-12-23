(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./mixin"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mixin_1 = require("./mixin");
    class Resolver {
        constructor() {
            this.paths = {};
            this.ignores = {};
            this.modules = {};
        }
        get last() { return this.current; }
        register(url) {
            var modules = this.modules, ignores = this.ignores, module = modules[url], promise;
            if (module) {
                return promise = module;
            }
            else {
                if (ignores[url]) {
                    var callback = new Function(`return ${ignores[url]};`);
                    var v = {};
                    return module = modules[url] = new Promise(resolve => resolve({ module: callback, dependencies: [] }));
                }
                else {
                    promise = this.download(url);
                    return module = modules[url] = promise.then((current) => {
                        var tmp = url.split("/");
                        tmp[tmp.length - 1] = "";
                        return new Promise(resolve => {
                            current && current({
                                baseUrl: tmp.join("/"),
                                setModule: (m) => resolve(m)
                            });
                        });
                    });
                }
            }
        }
        define(uris, callback) {
            var paths = this.paths;
            if (arguments.length >= 3) {
                uris = arguments[1];
            }
            else if (arguments.length <= 1) {
                uris = [];
            }
            new Promise((resolve, reject) => {
                this.current = resolve;
            }).then((data) => {
                var baseUrl = data.baseUrl, setModule = data.setModule, exports = {}, concat = (base, str) => {
                    return (base ? [base] : []).concat([str]).join("/");
                }, req = (uri) => require(mixin_1.normalizePath(paths, concat(baseUrl, uri), uri));
                Promise.all(mixin_1.map(uris, (uri) => {
                    return uri === "exports" && exports ||
                        uri === "require" && req ||
                        this.register(mixin_1.normalizePath(paths, concat(baseUrl, uri), uri));
                })).then((results) => {
                    setModule && setModule({ module: callback, dependencies: results });
                });
            });
        }
        resolve(uri) {
            if (this.modules[uri]) {
                return this.modules[uri];
            }
            return new Promise((resolve) => {
                this.define([uri], () => { });
                this.current && this.current({ baseUrl: "", setModule: resolve });
            });
        }
    }
    exports.Resolver = Resolver;
});
