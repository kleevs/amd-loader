import { load } from "../src/build";

load("./modules/index").then((value) => {
    console.log(value);
    console.log(value.dependencies);
});