import { Writer } from './abstract';
import * as fs from 'fs';

export class DefaultWriter extends Writer {
    constructor(private _config: any) {
        super();
    }
	
    write(file: string, content: string): void {
		fs.writeFileSync(file, content);
	}
}
