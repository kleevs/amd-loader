import { Loader } from './abstract';
import * as fs from 'fs';
import * as path from 'path';

export class DefaultLoader extends Loader {
    private _tab = 0;
    private _ignoreModules = [];
	
    constructor(private _config: any) {
        super();
    }
    
    private getAbsoluteUri = (uri, context?) => {
        var config: any = this._config || {};
		var ignore;
		
        if (config) { 
            config.path && config.path.some(path => {
                if (uri.match(path.test)) {
                    uri = uri.replace(path.test, path.result);
                    return true;
                }
            });
        }
        var href = (uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;
        var res = href.replace(/^(.*)$/, '$1.js');
        return path.normalize(res).replace(/\\/gi, "/").replace(/^\/?(.*)/gi, "$1")
    }
	
	private ignore = (uri) => {
        var config: any = this._config || {};
		var ignore;
		
        config && config.ignore && config.ignore.some(path => {
			if (uri.match(path.test)) {
				ignore = path.result;
				return true;
			}
		});
		
		return ignore;
    }
    
    private getLocalDependencies(id: string, content: string): string[] {
        var regex = /define\s*\([^,]*,?\s*(\[(\s*"[^"]*",?\s*)*\])/gi;
        var res: any = content && regex.exec(content) || undefined;
        res = res && res[1];
        res = res && new Function(`return ${res};`)();
        res = res && res.filter((s) => s !== "require" && s!== "exports");
        res = res || [];
        return res;
    }
    
    match(id: string): boolean { return true; }

    load(id: string): { content: string, dependencies: string[] } {
        var content, dependencies;
        
        if (id !== "0-core-define") {
            content = fs.readFileSync(id).toString().replace(/define\(/, `define('${id}', `);
            var local = this.getLocalDependencies(id, content);
			this._ignoreModules = this._ignoreModules.concat(local.map((d) => { 
					var res = this.ignore(d); 
					res = res && { id: d, content: res };
					return res;
				})
				.filter(mod => !!mod));
				
			dependencies = local.filter(d => !this.ignore(d)).map(dependency => this.getAbsoluteUri(dependency, id));
            console.log(`${id} => [${dependencies.join(', ')}]`);
			dependencies.push("0-core-define");
        } else {
            content = `
var define = (function() {
    var paths = [${this._config && this._config.path && this._config.path.map((item) => { return `{ test: /${item.test.source}/, result: ${JSON.stringify(item.result)} }`; }) || ''}];
    var modules = {};
    var getUri = function(uri, context?) {
        paths.some(path => {
            if (uri.match(path.test)) {
                uri = uri.replace(path.test, path.result);
                return true;
            }
        });
        var href = (uri && !uri.match(/^\//) && context && context.replace(/(\/?)[^\/]*$/, '$1') || '') + uri;
        var res = href.replace(/^(.*)$/, '$1.js');
        return path.normalize(res).replace(/\\/gi, "/")
    }
    var define = function (id, dependencies, factory) {
        modules[id] = factory(dependencies.map(function (d) { 
            if (d !== "exports" && d !== "require") {
                return modules[getUri(d, id)]; 
            }
            
            if (d === "exports") {
                return modules[id] = {};
            }
            
            if (d === "require") {
                return function (k) { return modules[getUri(k, id)] || req(getUri(k, id)); };
            }
        })) || modules[id];
    }
    define.amd = true;
	${this._ignoreModules.map(m => {
		return `define("${m.id}", [], ${m.content});`;
	}).join("\n")}
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
