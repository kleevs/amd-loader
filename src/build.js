var fs = require('fs');
var path = require('path');
class Loader {
}
class DefaultLoader extends Loader {
    match(id) { return true; }
    getDependencies(id, content) {
        var res = content && (/define\s*\([^,]*,?\s*(\[(\s*"[^"]*",?\s*)*\])/gi).exec(content) || undefined;
        res = res && res[1];
        res = res && new Function(`return ${res};`)();
        res = res && res.filter((s) => s !== "require" && s !== "exports");
        return res;
    }
    transpiler(id, content) {
        return content;
    }
}
class Compiler {
    constructor(options) {
        var fileName = path.join(process.cwd(), "build.js");
        this.options = options || require(fileName);
    }
    apply(loaders) {
        var options = this.options || {};
        var config = options && options.config || {};
        var modules = {};
        loaders = loaders || [];
        loaders.push(new DefaultLoader());
        options.ignores = options.ignores || {};
        var getAbsoluteUri = (uri, context) => {
            var href = (uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;
            if (config && config.path) {
                config.path.forEach(path => {
                    if (href.match(path.test)) {
                        return href.replace(path.test, path.result);
                    }
                });
            }
            return href.replace(/^(.*)$/, '$1.js');
        };
        function load(uri) {
            uri = path.normalize(uri).replace(/\\/gi, "/");
            if (modules[uri]) {
                return modules[uri];
            }
            if (!options.ignores || !options.ignores[uri]) {
                console.log(uri);
                var loader = loaders.filter(loader => loader.match(uri))[0];
                var fileContent = fs.readFileSync(uri).toString();
                var dependencies = loader && loader.getDependencies(uri, fileContent) || [];
                return modules[uri] = {
                    id: uri,
                    written: false,
                    content: loader.transpiler(uri, fileContent),
                    dependencies: dependencies.map(dependency => load(getAbsoluteUri(dependency, uri)))
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
        var result = `(function() {\r\n${bundlerify(main).map(m => m.content).filter(m => !!m).join("\r\n")}\r\n})()`;
        fs.writeFileSync(`${options.out}`, result);
    }
}
module.exports = Compiler;
module.exports = Loader;
new Compiler().apply();
