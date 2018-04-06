import { Dependencer } from './abstract';
import * as path from 'path';

export class DefaultDependencer extends Dependencer {

    constructor(private _config: any) {
        super();
    }

	getDependencies(id: string, content: string): string[] {
		var config: any = this._config || {};
		var regex = /define\s*\([^,]*,?\s*(\[(\s*"[^"]*",?\s*)*\])/gi;
        var res: any = content && regex.exec(content) || undefined;
        res = res && res[1];
        res = res && new Function(`return ${res};`)();
        res = res && res.filter((s) => s !== "require" && s!== "exports");
        res = res || [];
		
		res = res.map(d => {
			config && config.path && config.path.some(path => {
				if (d.match(path.test)) {
					d = d.replace(path.test, path.result);
					return true;
				}
			});
			
			var href = (d && !d.match(/^\//) && id && id.replace(/(\/?)[^\/]*$/, '$1') || '') + d;
			var res = href.replace(/^(.*)$/, '$1.js');
			return path.normalize(res).replace(/\\/gi, "/").replace(/^\/?(.*)/gi, "$1")
		});
		
		console.log(id + " => [" + res.join(", ") + "]");
        return res;
	}
}
