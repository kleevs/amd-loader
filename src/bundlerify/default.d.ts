import { Bundlerify, Module } from './abstract';
export declare class DefaultBundlerify extends Bundlerify {
    private _config;
    constructor(_config: any);
    apply(module: Module): {
        id: string;
        content: string;
    }[];
    bundle(main: Module): string;
}
