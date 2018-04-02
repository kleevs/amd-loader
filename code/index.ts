(function () { 
    var allmodules = { "...": {} };
    var config;

    var getAbsoluteUri = (uri, context?) => {
        var link = document.createElement("a");
        link.href = (uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;
        if (config && config.path) { 
            config.path.forEach(path => {
                if (uri.match(path.test)) {
                    link.href = uri;
                    return link.href.replace(path.test, path.result);
                }
            });
        }
        
        return link.href.replace(/^(.*)$/, '$1.js');
    }

    var require = function (uri) {
        var mod = define([uri], () => {});
        allmodules["..."] = {};
        mod();
    }

    var define = function (dependencies, modulefactory) {
        var exp;
        var id = "...";
        if (arguments.length >= 3) {
            id = arguments[0];
            dependencies = arguments[1];
            modulefactory = arguments[2];
        } else if (arguments.length <= 1) {
            dependencies = [];
            modulefactory = arguments[0];
        }

        return allmodules["..."]["..."] = allmodules["..."][id] = (context?) => {
            return Promise.all(dependencies.map(function(dependency) {
                if (dependency === "require") return undefined;
                if (dependency === "exports") return exp = {};
                
                return new Promise(resolve => {
                    var script = document.createElement('script');
                    script.async = true;
                    script.src = getAbsoluteUri(dependency, context);
                    document.head.appendChild(script);
                    script.onload = (<any>script).onreadystatechange = () => {
                        allmodules[dependency] = allmodules["..."]["..."];
                        allmodules["..."] = {};
                        allmodules[dependency] = allmodules[dependency] && allmodules[dependency](dependency).then(module => resolve(module)) || resolve();
                    };
                });
            })).then(function (result) {
                var module = modulefactory.apply(this, result) || exp;
                return module;
            });
        };
    }

    var context: any = window;
    context.define = define;
    context.require = require;
    context.require.config = (options) => {
        config = options;
    }
})();