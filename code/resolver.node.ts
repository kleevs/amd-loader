import { Resolver } from "./resolver";

export class NodeResolver extends Resolver {
    protected download(url: string): Promise<Function> {
		var me = this;
		var fs = require('fs');
		var fileContent = fs.readFileSync(`${url}.js`).toString();
		var define: any = function () { me.define.apply(me, arguments) };
		define.amd = true;
		(new Function("define", fileContent))(define);

		return new Promise(resolve => {
			resolve((arg) => { 
				this.last(arg); 
			});
		});
	}
}