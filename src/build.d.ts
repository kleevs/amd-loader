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
    abstract getDependencies(id: string, content: string): string[];
    abstract transpiler(id: string, content: string): string;
}
declare class DefaultLoader extends Loader {
    match(id: string): boolean;
    getDependencies(id: string, content: string): string[];
    transpiler(id: string, content: string): string;
}
declare class Compiler {
    private options;
    constructor(options?: any);
    apply(loaders?: Loader[]): void;
}
