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
        download(url) {
            var me = this;
            var fs = require('fs');
            var fileContent = fs.readFileSync(`${url}.js`).toString();
            var define = function () { me.define.apply(me, arguments); };
            define.amd = true;
            (new Function("define", fileContent))(define);
            var last = this.last;
            return new Promise(resolve => {
                resolve((arg) => {
                    last(arg);
                });
            });
        }
    }
    exports.NodeDownloader = NodeDownloader;
});
