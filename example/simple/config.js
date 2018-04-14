define(["require", "exports", "../../dist/amd-loader"], function (require, exports, amd_loader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    console.log("chargement config en cours.");
    amd_loader_1.load("./index").then(() => {
        console.log("chargement de la lib fini.");
    });
});
