import { build } from "./build";

var fs = require('fs');
var path = require('path');
var fileName = path.join(process.cwd(), process.argv[2] || "build.json");
fs.readFile(fileName, function(err, data) {
  if (!err) {
    var config = JSON.parse(data);
    Promise.all(config.map((conf) => new Promise(resolve => {
      build(conf.main, conf.option).then(function (value) {
        fs.writeFileSync(conf.out, value);
        resolve();
      });
    })
  )).then(() => {
    process.exit();
  });
  }
});
