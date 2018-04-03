(function() {
define('module3', ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Base {
        constructor() {
            console.log("base construit");
        }
    }
    exports.Base = Base;
});

define('module2', ["require", "exports", "module3"], function (require, exports, base_1) {
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

define('module4', ["require", "exports", "module3"], function (require, exports, base_1) {
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

define('module1', ["require", "exports", "module2", "module4"], function (require, exports, test_1, test_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tmp = new test_1.Test();
    var tmp2 = new test_2.Test();
    console.log("yes");
});

})()