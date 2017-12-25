"use strict";
exports.__esModule = true;
var build_1 = require("../src/build");
var fs = require('fs');
build_1.build("../src/index").then(function (value) {
    fs.writeFileSync("../dist/amd-loader.js", value);
});
