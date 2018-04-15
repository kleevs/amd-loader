declare let __META__: any;
var allmodules = { "...": {} };
var loadedmodules = {};
var configuration;

var normalize = function (path) {
    var tmp = path.split("/");
    var i = 0;
    var last = -1;
    while (i <tmp.length) {
        if (tmp[i] === "..") {
            tmp[i] = ".";
            last > 0 && (tmp[last] = ".");
            last-=2;
        } else if (tmp[i] === ".") {
            last--;
        }
        last++;
        i++;
    }

    return tmp.filter(_ => _ !== ".").join("/");
}

var getAbsoluteUri = (uri, context?) => {
    var match = false;
    if (configuration && configuration.path) { 
        configuration.path.some(path => {
            if (uri.match(path.test)) {
                uri = uri.replace(path.test, path.result);
                return match = true;
            }
        });
    }
    
    var href = (!match && uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;
    href = href.replace(/^(.*)$/, '$1.js'); 
    href = normalize(href);
    var script = document.createElement('script');
    script.src = href;
    href = script.src;
    return href;
}

export function load(uri) {
    return new Promise(resolve => {
        var mod = define([uri], (module) => { resolve(module); });
        allmodules["..."] = {};
        mod();
    });
}

export function define(modulefactory): (context?) => Promise<any>;
export function define(dependencies, modulefactory): (context?) => Promise<any>;
export function define(identifier, dependencies, modulefactory): (context?) => Promise<any>
export function define(identifier, dependencies?, modulefactory?): (context?) => Promise<any> {
    var exp;
    var id = "...";
    if (arguments.length >= 3) {
        id = arguments[0];
        dependencies = arguments[1];
        modulefactory = arguments[2];
    } else if (arguments.length === 2) {
        dependencies = arguments[0];
        modulefactory = arguments[1];
    } else if (arguments.length <= 1) {
        dependencies = [];
        modulefactory = arguments[0];
    }

    return allmodules["..."]["..."] = allmodules["..."][id] = (context?) => {
        return Promise.all(dependencies.map(function(dependency) {
            if (dependency === "require") return (uri) => loadedmodules[getAbsoluteUri(uri, context)];
            if (dependency === "exports") return exp = {};
            var src = getAbsoluteUri(dependency, context);

            return allmodules[src] = allmodules[src] || new Promise(resolve => {
                var script = document.createElement('script');
                script.src = src;
                script.async = true;
                document.head.appendChild(script);
                script.onload = (<any>script).onreadystatechange = () => {
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
            };
            return module;
        });
    };
}
(<any>define).amd = {};

export function config(options) {
    configuration = options;
}

if (typeof __META__ === "undefined" || __META__.MODE !== "AMD") {
    var context: any = window;
    context.define = define;
    var scripts= document.getElementsByTagName('script');
    var path = scripts[scripts.length-1].src.split('?')[0];
    allmodules[path] = Promise.resolve(exports);
}
