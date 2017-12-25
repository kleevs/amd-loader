import { sub } from "./sub";
import { base } from "./base/base";

export function test() {
    console.log("test");
    sub();
    base();
}

test();