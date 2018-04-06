import { Transpiler } from './abstract';
export declare class DefaultTranspiler extends Transpiler {
    private _config;
    constructor(_config: any);
    transpile(id: string, content: string): string;
}
