import { Transpiler } from './abstract';

export class DefaultTranspiler extends Transpiler {

    constructor(private _config: any) {
        super();
    }

	transpile(id: string, content: string) {
		return content.replace(/define\(/, `define('${id}', `);
	}
}
