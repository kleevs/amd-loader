import { WebDownloader } from "./downloader.web";

let resolver = new WebDownloader({});
export function config(config: { paths?: any}) { 
    resolver = new WebDownloader(config);
}

function load(uri: string) { 
    resolver.resolve(uri);
}

(<any>window).require = load;
(<any>window).require.config = config;