"use strict";
exports.__esModule = true;
var resolver_node_1 = require("resolver.node");
var resolver = new resolver_node_1.NodeResolver();
function load(uri) {
    return resolver.resolve(uri);
}
exports.load = load;
