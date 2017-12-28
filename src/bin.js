(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./build"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const build_1 = require("./build");
    var fs = require('fs');
    var path = require('path');
    var fileName = path.join(process.cwd(), process.argv[2] || "build.json");
    fs.readFile(fileName, function (err, data) {
        if (!err) {
            var config = JSON.parse(data);
            Promise.all(config.map((conf) => new Promise(resolve => {
                build_1.build(conf.main, conf.option).then(function (value) {
                    fs.writeFileSync(conf.out, value);
                    resolve();
                });
            }))).then(() => {
                process.exit();
            });
        }
    });
});
