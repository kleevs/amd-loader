import { WebDownloader } from "./downloader.web";

let resolver = new WebDownloader({});
export function config(config: { paths?: any}) { 
    resolver = new WebDownloader(config);
}

function load(uri: string): Promise<any> { 
    return resolver.resolve(uri).then(module => (<any>module).value);
}

(<any>window).require = load;
(<any>window).require.config = config;