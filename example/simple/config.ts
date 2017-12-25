console.log("yo");

(<any>window).require("./index", () => {
    console.log("parfait");
});

