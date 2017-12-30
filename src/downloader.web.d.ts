import { Downloader } from "./downloader";
export declare class WebDownloader extends Downloader {
    constructor(conf: {
        paths?: {};
    });
    protected download(url: string): Promise<Function>;
}
