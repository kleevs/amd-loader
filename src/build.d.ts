export declare function load(uri: string): Promise<{
    module: Function;
    dependencies: any[];
}>;
