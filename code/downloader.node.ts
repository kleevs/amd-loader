import { Downloader } from "./downloader";

export class NodeDownloader extends Downloader {
	public constructor(paths = {}, private ignores = {}) {
		super(paths);
	}

    protected download(url: string): Promise<Function> {
		var me = this;
		var fs = require('fs');
		var fileContent = fs.readFileSync(`${url}.js`).toString();
		var define: any = function () { me.define.apply(me, arguments) };
		define.amd = true;
		var last;
		if (!this.ignores || !this.ignores[url]) {
			try {
				(new Function("define", fileContent))(define);
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