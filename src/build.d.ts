declare var fs: any;
declare var path: any;
declare type Module = {
    id: string;
    content: string;
    dependencies: Module[];
    written: boolean;
};
declare abstract class Loader {
    abstract match(id: string): boolean;
    abstract load(id: string): {
        content: string;
        dependencies: string[];
    };
}
declare class DefaultLoader extends Loader {
    private getAbsoluteUri;
    private getLocalDependencies(id, content);
    match(id: string): boolean;
    load(id: string): {
        content: string;
        dependencies: string[];
    };
}
declare class Compiler {
    private options;
    constructor(options?: any);
    apply(loaders?: Loader[]): void;
}
