import { Loader } from './abstract';
import * as fs from 'fs';

export class DefaultLoader extends Loader {
	
    constructor(private _config: any) {
        super();
    }

	load(id: string): string {
		var moduleid = this.isRequired(id);
		var content = moduleid && `define([], function() { return ${moduleid}; });` || fs.readFileSync(id).toString() || '';
		return content;
	}
	
	private isRequired(uri) {
        var config: any = this._config || {};
		var moduleid;
		
        config && config.require && Object.keys(config.require).some(id => {
			var path = config.require[id];
			var paths = path instanceof Array ? path : [path];
			return paths.some(path => {
				if (uri.match(path.for)) {
					moduleid = id;
					return true;
				}
			});
		});
		
		return moduleid;
    }
}
