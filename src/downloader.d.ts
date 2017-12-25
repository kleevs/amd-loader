export declare abstract class Downloader {
    private config;
    protected readonly last: any;
    private resolver;
    private modules;
    private current;
    constructor(config?: {});
    private normalizePath(path, uri);
    private register(url);
    protected define(uris: string[], callback: Function): void;
    resolve(uri: string): Promise<{
        module: Function;
        dependencies: any[];
    }>;
    protected abstract download(url: string): Promise<Function>;
}
