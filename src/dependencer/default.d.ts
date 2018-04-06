import { Dependencer } from './abstract';
export declare class DefaultDependencer extends Dependencer {
    private _config;
    constructor(_config: any);
    getDependencies(id: string, content: string): string[];
}
