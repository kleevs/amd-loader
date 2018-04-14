(function (factory) {
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
    var allmodules = { "...": {} };
    var loadedmodules = {};
    var configuration;
    var getAbsoluteUri = (uri, context) => {
        var link = document.createElement("a");
        if (configuration && configuration.path) {
            configuration.path.some(path => {
                if (uri.match(path.test)) {
                    uri = uri.replace(path.test, path.result);
                    return true;
                }
            });
        }
        link.href = (uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;
        return link.href.replace(/^(.*)$/, '$1.js');
    };
    function load(uri) {
        return new Promise(resolve => {
            var mod = define([uri], (module) => { resolve(module); });
            allmodules["..."] = {};
            mod();
        });
    }
    exports.load = load;
    function define(identifier, dependencies, modulefactory) {
        var exp;
        var id = "...";
        if (arguments.length >= 3) {
            id = arguments[0];
            dependencies = arguments[1];
            modulefactory = arguments[2];
        }
        else if (arguments.length === 2) {
            dependencies = arguments[0];
            modulefactory = arguments[1];
        }
        else if (arguments.length <= 1) {
            dependencies = [];
            modulefactory = arguments[0];
        }
        return allmodules["..."]["..."] = allmodules["..."][id] = (context) => {
            return Promise.all(dependencies.map(function (dependency) {
                if (dependency === "require")
                    return (uri) => loadedmodules[getAbsoluteUri(uri, context)];
                if (dependency === "exports")
                    return exp = {};
                var src = getAbsoluteUri(dependency, context);
                return allmodules[src] = allmodules[src] || new Promise(resolve => {
                    var script = document.createElement('script');
                    script.async = true;
                    script.src = src;
                    document.head.appendChild(script);
                    script.onload = script.onreadystatechange = () => {
                        allmodules[src] = allmodules["..."]["..."];
                        allmodules["..."] = {};
                        allmodules[src] = allmodules[src] && allmodules[src](src).then(module => resolve(loadedmodules[src] = module)) || resolve();
                    };
                });
            })).then(function (result) {
                var module = modulefactory.apply(this, result) || exp;
                if (id && id !== "...") {
                    allmodules[id] = Promise.resolve(module);
                    loadedmodules[id] = module;
                }
                ;
                return module;
            });
        };
    }
    exports.define = define;
    define.amd = {};
    function config(options) {
        configuration = options;
    }
    exports.config = config;
    if (typeof __META__ === "undefined" || __META__.MODE !== "AMD") {
        var context = window;
        context.define = define;
        var scripts = document.getElementsByTagName('script');
        var path = scripts[scripts.length - 1].src.split('?')[0];
        allmodules[path] = Promise.resolve(exports);
    }
});
