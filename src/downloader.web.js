(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./downloader", "./mixin"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const downloader_1 = require("./downloader");
    const mixin_1 = require("./mixin");
    class WebDownloader extends downloader_1.Downloader {
        constructor(conf) {
            super(conf.paths || {});
        }
        download(url) {
            var me = this;
            window.define = function () { return me.define.apply(me, arguments); };
            window.define.amd = true;
            url = url.indexOf("/") !== 0 && `/${url}` || url;
            var script = document.createElement('script');
            script.async = true;
            script.src = `${url}.js`;
            document.head.appendChild(script);
            return new Promise(resolve => {
                script.onload = script.onreadystatechange = () => {
                    var last = this.last;
                    resolve((arg) => {
                        var setModule = arg.setModule;
                        arg.setModule = (m) => {
                            m.value = m.value || m.module.apply(null, mixin_1.map(m.dependencies, (d) => {
                                return d.value || d === "require" && ((uri) => m.dependencies[m.uris.indexOf(uri)].value) || d;
                            })) || m.dependencies[m.uris.indexOf("exports")];
                            return setModule(m);
                        };
                        var res = last(arg);
                        return res;
                    });
                };
            });
        }
    }
    exports.WebDownloader = WebDownloader;
});
