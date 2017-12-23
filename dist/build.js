(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "resolver.node"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const resolver_node_1 = require("resolver.node");
    let resolver = new resolver_node_1.NodeResolver();
    function load(uri) {
        return resolver.resolve(uri);
    }
    exports.load = load;
});
