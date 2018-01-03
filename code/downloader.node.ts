import { Downloader } from "./downloader";

export class NodeDownloader extends Downloader {
	public constructor(paths = {}, private ignores = {}) {
		super(paths);
	}

	public global = {};

    protected download(url: string): Promise<Function> {
		var me = this;
		var fs = require('fs');
		var fileContent = fs.readFileSync(`${url}.js`).toString();
		var define: any = function () { me.define.apply(me, arguments) };
		define.amd = true;
		var last;
		if (!this.ignores || !this.ignores[url]) {
			try {
				var code = [
					"__decorate",
					"__metadata"
				].map(name => ` ___.${name} = typeof ${name} !== 'undefined' && ${name} || ___.${name};`).join("\r\n");
				(new Function("define", "___", `${fileContent}\r\n${code}`))(define, this.global);
			} catch (e) {
				console.error(`Error in file ${url}.`);
				throw e;
			}
			last = this.last;
		} else {
			last = (data) => {
				data.setModule && data.setModule({ uri: data.url, module: new Function(`return ${this.ignores[url]};`), dependencies: [], uris: [] });
			};
		}

		return new Promise(resolve => {
			resolve((arg) => { 
				last(arg); 
			});
		});
	}
}