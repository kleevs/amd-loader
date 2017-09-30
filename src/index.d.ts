declare module AMDLoader {
    let baseUrl: string;
    let paths: any;
    function load(uris: string[], callback: Function): void;
    function get(name: string): any;
}
