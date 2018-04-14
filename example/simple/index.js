define(["require", "exports", "./test", "./tools/test"], function (require, exports, test_1, test_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (typeof __META__ !== "undefined" && __META__) {
        if (__META__.MODE === "AMD") {
            console.log("is amd");
        }
        else if (__META__.MODE === "NODE") {
            console.log("is node");
        }
        else {
            console.log("is script");
        }
    }
    console.log("chargement de la lib en cours.");
    var tmp = new test_1.Test();
    var tmp2 = new test_2.Test();
    function maLib() {
        return "ma lib";
    }
    exports.maLib = maLib;
});
