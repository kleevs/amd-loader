import { Loader } from './abstract';
export declare class DefaultLoader extends Loader {
    private _config;
    constructor(_config: any);
    load(id: string): string;
    private isRequired(uri);
}
