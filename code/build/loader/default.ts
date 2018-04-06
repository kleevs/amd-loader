import { Loader } from './abstract';
import * as fs from 'fs';

export class DefaultLoader extends Loader {
	
    constructor(private _config: any) {
        super();
    }

	load(id: string): string {
		return this.ignore(id) || fs.readFileSync(id).toString();
	}
	
	private ignore(uri) {
        var config: any = this._config || {};
		var ignore;
		
        config && config.ignore && config.ignore.some(path => {
			if (uri.match(path.test)) {
				ignore = `define([], ${path.result});`;
				return true;
			}
		});
		
		return ignore;
    }
}
