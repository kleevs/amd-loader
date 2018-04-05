(function () { 
    var allmodules = { "...": {} };
    var loadedmodules = {};
    var config;

    var getAbsoluteUri = (uri, context?) => {
        var link = document.createElement("a");
		if (config && config.path) { 
			config.path.some(path => {
				if (uri.match(path.test)) {
					uri = uri.replace(path.test, path.result);
					return true;
				}
			});
		}
		
        link.href = (uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;   
        return link.href.replace(/^(.*)$/, '$1.js');
    }

    var require = function (uri) {
        return new Promise(resolve => {
            var mod = define([uri], (module) => { resolve(module); });
            allmodules["..."] = {};
            mod();
        });
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
                if (dependency === "require") return (uri) => loadedmodules[getAbsoluteUri(uri, context)];
                if (dependency === "exports") return exp = {};
                var src = getAbsoluteUri(dependency, context);

                return allmodules[src] || new Promise(resolve => {
                    var script = document.createElement('script');
                    script.async = true;
                    script.src = src;
                    document.head.appendChild(script);
                    script.onload = (<any>script).onreadystatechange = () => {
                        allmodules[src] = allmodules["..."]["..."];
                        allmodules["..."] = {};
                        allmodules[src] = allmodules[src] && allmodules[src](dependency).then(module => resolve(loadedmodules[src] = module)) || resolve();
                    };
                });
            })).then(function (result) {
                var module = modulefactory.apply(this, result) || exp;
                return module;
            });
        };
    }

    var context: any = window;
	(<any>define).amd = true;
    context.define = define;
    context.require = require;
    context.require.config = (options) => {
        config = options;
    }
})();