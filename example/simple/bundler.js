<<<<<<< HEAD
=======
(function() {
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Base {
        constructor() {
            console.log("base construit");
        }
    }
    exports.Base = Base;
});

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

define(["require", "exports", "./base/base"], function (require, exports, base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Test extends base_1.Base {
        constructor() {
            super();
            console.log("tool construit");
        }
    }
    exports.Test = Test;
});

>>>>>>> 482b45729a0622910968bb521442379b8aae6327
define(["require", "exports", "./test", "./tools/test"], function (require, exports, test_1, test_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tmp = new test_1.Test();
    var tmp2 = new test_2.Test();
    console.log("yes");
});
<<<<<<< HEAD
=======

})()
>>>>>>> 482b45729a0622910968bb521442379b8aae6327
