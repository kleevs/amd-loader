import { Downloader } from "./downloader";
export declare class NodeDownloader extends Downloader {
    private ignores;
    constructor(paths?: {}, ignores?: {});
    global: {};
    protected download(url: string): Promise<Function>;
}
