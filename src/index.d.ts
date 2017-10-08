declare module AMDLoader {
    function define(uris: string[], callback: Function): void;
    function require(uri: string, callback?: Function): any;
}
