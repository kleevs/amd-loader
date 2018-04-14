import { load } from "../../dist/amd-loader";
console.log("chargement config en cours.");

load("./index").then(() => {
    console.log("chargement de la lib fini.");
});

