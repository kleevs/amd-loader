<<<<<<< HEAD
define(["require", "exports"], function (require, exports) {
=======
define(["require", "exports", "./tools/base/base"], function (require, exports, base_1) {
>>>>>>> 482b45729a0622910968bb521442379b8aae6327
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
