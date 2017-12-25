import { Downloader } from "./downloader";

export class NodeDownloader extends Downloader {
    protected download(url: string): Promise<Function> {
		var me = this;
		var fs = require('fs');
		var fileContent = fs.readFileSync(`${url}.js`).toString();
		var define: any = function () { me.define.apply(me, arguments) };
		define.amd = true;
		(new Function("define", fileContent))(define);
		var last = this.last;
		return new Promise(resolve => {
			resolve((arg) => { 
				last(arg); 
			});
		});
	}
}