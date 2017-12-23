import { Resolver } from "./resolver";
export declare class NodeResolver extends Resolver {
    protected download(url: string): Promise<Function>;
}
