import { Test } from './test';
import { Test as Tool } from './tools/test';

declare let __META__: any;

if (typeof __META__ !== "undefined" && __META__) 
{
	if (__META__.MODE === "AMD") {
		console.log("is amd");
	} else if (__META__.MODE === "NODE") {
		console.log("is node");
	} else {
		console.log("is script");
	}
}

var tmp = new Test();
var tmp2 = new Tool();
console.log("yes");

export function maLib() {
	return "ma lib";
}