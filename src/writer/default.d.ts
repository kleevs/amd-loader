import { Writer } from './abstract';
export declare class DefaultWriter extends Writer {
    private _config;
    constructor(_config: any);
    write(file: string, content: string): void;
}
