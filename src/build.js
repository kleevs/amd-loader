(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./loader/default", "fs", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const default_1 = require("./loader/default");
    const fs = require("fs");
    const path = require("path");
    class Compiler {
        constructor(options) {
            var fileName = path.join(process.cwd(), "build.js");
            this.options = options || require(fileName);
        }
        apply(loaders) {
            var options = this.options || {};
            var modules = {};
            loaders = loaders || [];
            loaders.push(new default_1.DefaultLoader(options.config));
            options.ignores = options.ignores || {};
            function load(uri) {
                uri = path.normalize(uri).replace(/\\/gi, "/");
                if (modules[uri]) {
                    return modules[uri];
                }
                if (!options.ignores || !options.ignores[uri]) {
                    var loader = loaders.filter(loader => loader.match(uri))[0];
                    var loader_result = loader && loader.load(uri);
                    var fileContent = loader_result && loader_result.content;
                    var dependencies = loader_result && loader_result.dependencies || [];
                    var mdependencies = dependencies.map(dependency => load(dependency));
                    return modules[uri] = {
                        id: uri,
                        written: false,
                        content: fileContent,
                        dependencies: mdependencies
                    };
                }
                else {
                    return { id: uri, content: '', dependencies: [], written: false };
                }
            }
            var bundlerify = (module) => {
                var res = [];
                module.dependencies && module.dependencies.forEach(dep => {
                    !dep.written && (dep.written = true) && bundlerify(dep).forEach(m => res.push(m));
                });
                res.push({ id: module.id, content: module.content });
                return res;
            };
            var main = load(options.main);
            var result = `(function(def, req) {\r\n${bundlerify(main).map(m => m.content).filter(m => !!m).join("\r\n")}\r\n})(typeof define !== 'undefined' && define, typeof require !== 'undefined' && require)`;
            fs.writeFileSync(`${options.out}`, result);
        }
    }
    exports.Compiler = Compiler;
});
