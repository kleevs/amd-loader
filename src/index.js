(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./downloader.web"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const downloader_web_1 = require("./downloader.web");
    let resolver = new downloader_web_1.WebDownloader({});
    function config(config) {
        resolver = new downloader_web_1.WebDownloader(config);
    }
    exports.config = config;
    function load(uri) {
        resolver.resolve(uri);
    }
    window.require = load;
    window.require.config = config;
});
