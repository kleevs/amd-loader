define(["require", "exports", "./tools/base/base"], function (require, exports, base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Test extends base_1.Base {
        constructor() {
            super();
            console.log("objet construit");
        }
    }
    exports.Test = Test;
});
