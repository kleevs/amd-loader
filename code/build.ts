import { NodeResolver } from "./resolver.node";

let resolver = new NodeResolver();
export function load(uri: string) : Promise<{ module: Function, dependencies: any[] }> { 
    return resolver.resolve(uri);
 }