export declare function load(uri: any): Promise<{}>;
export declare function define(modulefactory: any): (context?) => Promise<any>;
export declare function define(dependencies: any, modulefactory: any): (context?) => Promise<any>;
export declare function define(identifier: any, dependencies: any, modulefactory: any): (context?) => Promise<any>;
export declare function config(options: any): void;
