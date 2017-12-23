import { WebResolver } from "resolver.web";

let resolver = new WebResolver();
export function load(uri: string) { 
    resolver.resolve(uri);
 }