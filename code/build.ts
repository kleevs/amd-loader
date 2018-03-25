var fs = require('fs');
var path = require('path');

declare type Module = { id: string; content: string, dependencies: Module[] };

class Compiler {
    private options;
    constructor(options?) {
        var fileName = path.join(process.cwd(), "build.js");
        this.options = options || require(fileName);
    }

    apply(loaders: Loader[]) {
        var options = this.options || {};
        var config = options && options.config || {};

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
            console.log(uri);
            if (!options.ignores || !options.ignores[uri]) {
                try {
                    var loader = loaders.filter(loader => loader.match(uri))[0];
                    var fileContent = fs.readFileSync(uri).toString();
                    var dependencies = loader && loader.getDependencies(uri, fileContent) || [];
                    return { 
                        id: uri,
                        content: loader.transpiler(uri, fileContent), 
                        dependencies: dependencies.map(dependency => load(getAbsoluteUri(dependency, uri))) 
                    };
                }
                catch (e) {
                    console.error(`Error in file ${uri}.`);
                    throw e;
                }
            }
            else {
                return { id: uri, content: '', dependencies: [] };
            }
        }
        
        var bundlerify = (module: Module): { id: string; content: string }[] => {
            var res: { id: string; content: string }[] = [];
            module.dependencies && module.dependencies.forEach(dep => bundlerify(dep).forEach(m => res.push(m)));
            res.push({ id: module.id, content: module.content });
            return res;
        }
        
        var main = load(options.main);
        var result = bundlerify(main).map(m => m.content).join("\r\n");
        fs.writeFileSync(`${options.out}`, result);
    }
}

abstract class Loader {
    abstract match(id: string): boolean;
    abstract getDependencies(id: string, content: string): string[];
    abstract transpiler(id: string, content: string): string
}

class Test extends Loader {
    match(id: string): boolean { return true; }
    getDependencies(id: string, content: string): string[] {
        var res = content.match(/\bdefine\b/gi);
        console.log(res);
        return res;
    }
    transpiler(id: string, content: string): string {
        return content;
    }
}

module.exports = Compiler;
module.exports = Loader;
module.exports = Test;

new Compiler().apply([new Test()]);
