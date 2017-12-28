(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./downloader"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const downloader_1 = require("./downloader");
    class NodeDownloader extends downloader_1.Downloader {
        constructor(paths = {}, ignores = {}) {
            super(paths);
            this.ignores = ignores;
        }
        download(url) {
            var me = this;
            var fs = require('fs');
            var fileContent = fs.readFileSync(`${url}.js`).toString();
            var define = function () { me.define.apply(me, arguments); };
            define.amd = true;
            var last;
            if (!this.ignores || !this.ignores[url]) {
                try {
                    (new Function("define", fileContent))(define);
                }
                catch (e) {
                    console.error(`Error in file ${url}.`);
                    throw e;
                }
                last = this.last;
            }
            else {
                last = (data) => {
                    data.setModule && data.setModule({ uri: data.url, module: new Function(`return ${this.ignores[url]};`), dependencies: [], uris: [] });
                };
            }
            return new Promise(resolve => {
                resolve((arg) => {
                    last(arg);
                });
            });
        }
    }
    exports.NodeDownloader = NodeDownloader;
});
