import { WebDownloader } from "./downloader.web";

let resolver = new WebDownloader();
export function config(config) { 
    resolver = new WebDownloader(config);
}

function load(uri: string) { 
    resolver.resolve(uri);
}

(<any>window).require = load;