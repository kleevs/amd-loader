declare module AMDLoader {
    let paths: any;
    function load(uris: string[], callback: Function): void;
    function get(name: string): any;
}
