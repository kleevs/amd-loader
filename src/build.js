(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./loader/default", "./transpiler/default", "./dependencer/default", "./bundlerify/default", "./writer/default", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const default_1 = require("./loader/default");
    const default_2 = require("./transpiler/default");
    const default_3 = require("./dependencer/default");
    const default_4 = require("./bundlerify/default");
    const default_5 = require("./writer/default");
    const path = require("path");
    class Compiler {
        constructor(options) {
            var fileName = path.join(process.cwd(), "build.js");
            this.options = options || require(fileName);
        }
        apply(config) {
            var options = this.options || {};
            var modules = {};
            var loader = config && config.loader || new default_1.DefaultLoader(options.config);
            var transpiler = config && config.transpiler || new default_2.DefaultTranspiler(options.config);
            var dependencer = config && config.dependencer || new default_3.DefaultDependencer(options.config);
            var bundlerify = config && config.bundlerify || new default_4.DefaultBundlerify(options.config);
            var writer = config && config.writer || new default_5.DefaultWriter(options.config);
            function load(uri) {
                uri = path.normalize(uri).replace(/\\/gi, "/");
                if (modules[uri]) {
                    return modules[uri];
                }
                var fileContent = loader && loader.load(uri);
                var content = transpiler && transpiler.transpile(uri, fileContent);
                var dependencies = dependencer && dependencer.getDependencies(uri, content) || [];
                var mdependencies = dependencies.map(dependency => load(dependency));
                return modules[uri] = {
                    id: uri,
                    written: false,
                    content: content,
                    dependencies: mdependencies
                };
            }
            var main = load(options.main);
            var result = bundlerify && bundlerify.bundle(main);
            writer.write(options.out, result);
        }
    }
    exports.Compiler = Compiler;
});
