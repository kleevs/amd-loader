import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';

var root = path.join(process.cwd(), '/../../');

let server = http.createServer(function(req, res) {
    let uri = url.parse(req.url).pathname;

    fs.readFile(root + uri, 'utf8', function (err, data) {
        let content: string = data;
        if (err) {
            console.log(root + uri + " doesn't exist.");
            content = undefined;
            res.writeHead(404);
            res.end(content);
        } else {
            res.writeHead(200);
            res.end(content);
        }
    });
});

server.listen(80);
console.log("écoute sur le port : " + 80);