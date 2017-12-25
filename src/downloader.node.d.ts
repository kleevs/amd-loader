import { Downloader } from "./downloader";
export declare class NodeDownloader extends Downloader {
    protected download(url: string): Promise<Function>;
}
