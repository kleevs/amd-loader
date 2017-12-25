(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./downloader.node", "./resolver", "./mixin"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const downloader_node_1 = require("./downloader.node");
    const resolver_1 = require("./resolver");
    const mixin_1 = require("./mixin");
    let resolver = new downloader_node_1.NodeDownloader();
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
    function build(uri) {
        return resolver.resolve(uri).then((value) => {
            var modules = extract(value);
            var factory = new Function("req", `${[
                resolver_1.Resolver.toString(),
                `var resolver = new Resolver();`,
                `var names = [${mixin_1.map(modules, (m) => `"${m.uri}"`)}]`,
                `var res = [${Array.apply(null, Array(modules.length)).map(() => "{}").join(",")}];`,
                `var require = function(currentPath, name) { name = resolver.resolve(currentPath, name); return names.indexOf(name) >= 0 && res[names.indexOf(name)] || req(name); }`
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
                "typeof window !== 'undefined' && window || {}"
            ].join(", ")})`;
        });
    }
    exports.build = build;
});
