export declare abstract class Resolver {
    protected readonly last: any;
    private paths;
    private ignores;
    private modules;
    private current;
    private register(url);
    protected define(uris: string[], callback: Function): void;
    resolve(uri: string): Promise<{
        module: Function;
        dependencies: any[];
    }>;
    protected abstract download(url: string): Promise<Function>;
}
