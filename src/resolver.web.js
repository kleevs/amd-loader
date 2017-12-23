(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./resolver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const resolver_1 = require("./resolver");
    class WebResolver extends resolver_1.Resolver {
        download(url) {
            var tmp = window.define;
            window.define = () => this.define.apply(this, arguments);
            var script = document.createElement('script');
            script.async = true;
            script.src = `${url}.js`;
            document.head.appendChild(script);
            return new Promise(resolve => {
                script.onload = script.onreadystatechange = () => {
                    window.define = tmp;
                    resolve((arg) => this.last(arg));
                };
            });
        }
    }
    exports.WebResolver = WebResolver;
});
