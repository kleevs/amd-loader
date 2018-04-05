import { Loader } from './abstract';
export declare class DefaultLoader extends Loader {
    private _config;
    private _tab;
    private _ignoreModules;
    constructor(_config: any);
    private getAbsoluteUri;
    private ignore;
    private getLocalDependencies(id, content);
    match(id: string): boolean;
    load(id: string): {
        content: string;
        dependencies: string[];
    };
}
