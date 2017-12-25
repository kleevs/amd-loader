import { Downloader } from "./downloader";
export declare class WebDownloader extends Downloader {
    protected download(url: string): Promise<Function>;
}
