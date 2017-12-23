import { normalizePath, map } from "./mixin";

export abstract class Resolver {
    protected get last() { return this.current; }
    private paths = {};
	private ignores = {};
    private modules: { [s: string]: Promise<{ module: Function, dependencies: any[] }> } = {};
    private current: any;

    private register(url: string): Promise<any> {
        var modules = this.modules,
            ignores = this.ignores,
            module = modules[url],
			promise;

		if (module) {
			return promise = module;
		} else {			
			if (ignores[url]) {
				var callback = new Function(`return ${ignores[url]};`);
				var v = {};
				return module = modules[url] = new Promise(resolve => resolve({ module: callback, dependencies: [] }));
			} else {
				promise = this.download(url);
				return module = modules[url] = promise.then((current) => {
					var tmp = url.split("/");
					tmp[tmp.length-1] = "";

					return new Promise<any>(resolve => {
						current && current({ 
							baseUrl: tmp.join("/"), 
							setModule: (m) => resolve(m) 
						});
					});
				});
			}
		}
    }

	protected define(uris: string[], callback: Function) {
        var paths = this.paths;

        if (arguments.length >= 3) {
            uris = arguments[1];
        } else if (arguments.length <= 1) {
            uris = [];
        }

        new Promise((resolve, reject) => {
			this.current = resolve;
		}).then((data: {baseUrl: string, setModule: (module) => void, extra: any}) => {
			var baseUrl = data.baseUrl,
                setModule = data.setModule,
                exports = {},
                concat = (base, str) => {
                    return (base ? [base] : []).concat([str]).join("/");
                },
				req = (uri) => require(normalizePath(paths, concat(baseUrl, uri), uri));
				
			Promise.all(map(uris, (uri) => {
				return uri === "exports" && exports ||
					uri === "require" && req ||
					this.register(normalizePath(paths, concat(baseUrl, uri), uri));
			})).then((results) => {
				setModule && setModule({ module: callback, dependencies: results });
			});
		});
	}
	
	public resolve(uri: string): Promise<{ module: Function, dependencies: any[] }> {
        if (this.modules[uri]) {
            return this.modules[uri];
        }

        return new Promise((resolve) => {
            this.define([uri], () => {});
            this.current && this.current({ baseUrl: "", setModule: resolve });            
        });
    }

    protected abstract download(url: string): Promise<Function>;
}