var fs = require('fs');
var path = require('path');

declare type Module = { id: string; content: string, dependencies: Module[], written: boolean };

abstract class Loader {
    abstract match(id: string): boolean;
    abstract getDependencies(id: string, content: string): string[];
    abstract transpiler(id: string, content: string): string
}

class DefaultLoader extends Loader {
	private dictionary: any = {};
	private num: number = 0;
	
	private getAbsoluteUri = (uri, context?) => {
		var config: any = {};
		var href = (uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;
		if (config && config.path) { 
			config.path.forEach(path => {
				if (href.match(path.test)) {
					return href.replace(path.test, path.result);
				}
			});
		}
		
		var res = href.replace(/^(.*)$/, '$1.js');
		return path.normalize(res).replace(/\\/gi, "/")
	}
	
	private getLocalDependencies(id: string, content: string): string[] {
		var regex = /define\s*\([^,]*,?\s*(\[(\s*"[^"]*",?\s*)*\])/gi;
        var res: any = content && regex.exec(content) || undefined;
		res = res && res[1];
		res = res && new Function(`return ${res};`)();
		res = res && res.filter((s) => s !== "require" && s!== "exports");
        return res || [];
    }
	
    match(id: string): boolean { this.dictionary[id] = { resultname: `module${++this.num}`}; return true; }
    getDependencies(id: string, content: string): string[] {
		return this.getLocalDependencies(id, content).map(dependency => this.getAbsoluteUri(dependency, id));
    }
    transpiler(id: string, content: string): string {
		var dependencies = this.getLocalDependencies(id, content);
		var regex = /define\s*\([^,]*,?\s*(\[(\s*"[^"]*",?\s*)*\])/gi;
		content = content.replace(regex, (str) => {
			var res = str;
			dependencies.forEach(d => { 
				var absolute = this.getAbsoluteUri(d, id)
				res = res.replace(d, this.dictionary[absolute].resultname); 
			});
			return res;
		});
        return content.replace(/define\(/, `define('${this.dictionary[id] && this.dictionary[id].resultname || id}', `);
    }
}

class Compiler {
    private options;
    constructor(options?) {
        var fileName = path.join(process.cwd(), "build.js");
        this.options = options || require(fileName);
    }

    apply(loaders?: Loader[]) {
        var options = this.options || {};
        var config = options && options.config || {};
		var modules = {};
		loaders = loaders || [];
		
		loaders.push(new DefaultLoader());
		options.ignores = options.ignores || {};
		
        var getAbsoluteUri = (uri, context?) => {
            var href = (uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;
            if (config && config.path) { 
                config.path.forEach(path => {
                    if (href.match(path.test)) {
                        return href.replace(path.test, path.result);
                    }
                });
            }
            
            return href.replace(/^(.*)$/, '$1.js');
        }
        
        function load(uri): Module {
			uri = path.normalize(uri).replace(/\\/gi, "/");
			if (modules[uri]) {
				return modules[uri];
			}
			
            if (!options.ignores || !options.ignores[uri]) {
				console.log(uri);
				var loader = loaders.filter(loader => loader.match(uri))[0];
				var fileContent = fs.readFileSync(uri).toString();
				var dependencies = loader && loader.getDependencies(uri, fileContent) || [];
				var mdependencies = dependencies.map(dependency => load(dependency));
				return modules[uri] = { 
					id: uri,
					written: false,
					content: loader.transpiler(uri, fileContent), 
					dependencies: mdependencies
				};
            }
            else {
                return { id: uri, content: '', dependencies: [], written: false };
            }
        }
        
        var bundlerify = (module: Module): { id: string; content: string }[] => {
            var res: { id: string; content: string }[] = [];
            module.dependencies && module.dependencies.forEach(dep => { 
				!dep.written && (dep.written = true) && bundlerify(dep).forEach(m => res.push(m)); 
			});
            res.push({ id: module.id, content: module.content });
            return res;
        }
        
        var main = load(options.main);
        var result = `(function() {\r\n${bundlerify(main).map(m => m.content).filter(m => !!m).join("\r\n")}\r\n})()`;
        fs.writeFileSync(`${options.out}`, result);
    }
}

module.exports = Compiler;
module.exports = Loader;

new Compiler().apply();
