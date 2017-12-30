import { map } from "./mixin";
import { Resolver } from "./resolver";

export abstract class Downloader {
    protected get last() { return this.current; }
    private resolver: Resolver;
    private modules: { [s: string]: Promise<{ uri: string, module: Function, dependencies: any[], uris: string[] }> } = {};
	private current: any;
	
	public constructor(private config = {}) {
		this.resolver = new Resolver(config);
	}

	private normalizePath (path: string, uri: string) {
		return this.resolver.resolve(path, uri);
	}

    private register(url: string): Promise<any> {
        var modules = this.modules,
            module = modules[url],
			promise;

		if (module) {
			return promise = module;
		} else {			
			promise = this.download(url);
			return module = modules[url] = promise.then((current) => {
				var tmp = url.split("/");
				tmp[tmp.length-1] = "";

				return new Promise<any>(resolve => {
					current && current({ 
						url: url,
						baseUrl: tmp.join("/"), 
						setModule: (m) => resolve(m) 
					});
				});
			});
		}
    }

	protected define(uris: string[], callback: Function) {
        if (arguments.length >= 3) {
			uris = arguments[1];
			callback = arguments[2];
        } else if (arguments.length <= 1) {
			uris = [];
			callback = arguments[0];
        }

        new Promise((resolve, reject) => {
			this.current = resolve;
		}).then((data: {url: string, baseUrl: string, setModule: (module) => void, extra: any}) => {
			var baseUrl = data.baseUrl,
                setModule = data.setModule,
                exports = {};
				
			Promise.all(map(uris, (uri) => {
				return uri === "exports" && exports ||
					uri === "require" && "require" ||
					this.register(this.normalizePath(baseUrl, uri));
			})).then((results) => {
				setModule && setModule({ uri: data.url, module: callback, dependencies: results, uris: uris });
			});
		});
	}
	
	public resolve(uri: string): Promise<{ module: Function, dependencies: any[] }> {
        if (this.modules[uri]) {
            return this.modules[uri];
        }

        return new Promise((resolve) => {
            this.define([uri], () => {});
            this.current && this.current({ baseUrl: "", setModule: (m) => resolve(m.dependencies[0]) });            
        });
    }

    protected abstract download(url: string): Promise<Function>;
}