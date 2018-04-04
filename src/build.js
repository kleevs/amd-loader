var fs = require('fs');
var path = require('path');
class Loader {
}
class DefaultLoader extends Loader {
    constructor() {
        super(...arguments);
        this.getAbsoluteUri = (uri, context) => {
            var config = {};
            var href = (uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;
            if (config && config.path) {
                config.path.forEach(path => {
                    if (href.match(path.test)) {
                        return href.replace(path.test, path.result);
                    }
                });
            }
            var res = href.replace(/^(.*)$/, '$1.js');
            return path.normalize(res).replace(/\\/gi, "/");
        };
    }
    getLocalDependencies(id, content) {
        var regex = /define\s*\([^,]*,?\s*(\[(\s*"[^"]*",?\s*)*\])/gi;
        var res = content && regex.exec(content) || undefined;
        res = res && res[1];
        res = res && new Function(`return ${res};`)();
        res = res && res.filter((s) => s !== "require" && s !== "exports");
        res = res || [];
        return res;
    }
    match(id) { return true; }
    load(id) {
        var content, dependencies;
        if (id !== "0-core-define") {
            console.log(id);
            content = fs.readFileSync(id).toString().replace(/define\(/, `define('${id}', `);
            dependencies = this.getLocalDependencies(id, content)
                .map(dependency => this.getAbsoluteUri(dependency, id));
            dependencies.push("0-core-define");
        }
        else {
            content = `
var define = (function() {
	var modules = {};
	var getUri = ${this.getAbsoluteUri.toString()}
	var define = function (id, dependencies, factory) {
		modules[id] = factory(dependencies.map(function (d) { 
			if (d !== "exports" && d !== "require") {
				return modules[getUri(d, id)]; 
			}
			
			if (d === "exports") {
				return modules[id] = {};
			}
			
			if (d === "require") {
				return function (k) { return modules[getUri(k, id)]; };
			}
		})) || modules[id];
	}
	define.amd = true;
	return define; 
})();
`;
            dependencies = [];
        }
        return {
            content: content,
            dependencies: dependencies
        };
    }
}
class Compiler {
    constructor(options) {
        var fileName = path.join(process.cwd(), "build.js");
        this.options = options || require(fileName);
    }
    apply(loaders) {
        var options = this.options || {};
        var modules = {};
        loaders = loaders || [];
        loaders.push(new DefaultLoader());
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
        var result = `(function() {\r\n${bundlerify(main).map(m => m.content).filter(m => !!m).join("\r\n")}\r\n})()`;
        fs.writeFileSync(`${options.out}`, result);
    }
}
module.exports = Compiler;
module.exports = Loader;
new Compiler().apply();
