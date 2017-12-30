import { build } from "./build";

var fs = require('fs');
var path = require('path');
var fileName = path.join(process.cwd(), process.argv[2] || "build.json");
fs.readFile(fileName, function(err, data) {
  if (!err) {
    var config = JSON.parse(data);
    Promise.all(config.map((conf) => new Promise(resolve => {
      build(conf.main, conf.option).then(function (value) {
        var tmp = conf.out.replace(/\\/g, "/").split("/");
        tmp[tmp.length-1] = "";
        var relative = path.relative(tmp.join("/"), conf.main).replace(/\\/g, "/");
        fs.writeFileSync(`${conf.out}.js`, value);
        conf.declaration && fs.writeFileSync(`${conf.out}.d.ts`, `export * from '${relative}';`);
        resolve();
      });
    })
  )).then(() => {
    process.exit();
  });
  }
});
