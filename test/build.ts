import { build } from "../src/build";

declare let require;
var fs = require('fs');

build("./modules/index").then((value) => {
    fs.writeFileSync("dist.js", value);
});