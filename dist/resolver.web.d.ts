import { Resolver } from "./resolver";
export declare class WebResolver extends Resolver {
    protected download(url: string): Promise<Function>;
}
