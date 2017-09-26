declare module AMDLoader {
    let baseUrl: string;
    function load(uris: string[], callback: Function): void;
    function create(uri: string): Promise<any>;
}
