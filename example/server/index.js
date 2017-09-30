(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "http", "url", "fs", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const http = require("http");
    const url = require("url");
    const fs = require("fs");
    const path = require("path");
    var root = path.join(process.cwd(), '/../../');
    let server = http.createServer(function (req, res) {
        let uri = url.parse(req.url).pathname;
        fs.readFile(root + uri, 'utf8', function (err, data) {
            let content = data;
            if (err) {
                console.log(root + uri + " doesn't exist.");
                content = undefined;
                res.writeHead(404);
                res.end(content);
            }
            else {
                res.writeHead(200);
                res.end(content);
            }
        });
    });
    server.listen(80);
    console.log("écoute sur le port : " + 80);
});
//# sourceMappingURL=index.js.map