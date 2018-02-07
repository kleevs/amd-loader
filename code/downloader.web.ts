import { Downloader } from "./downloader";
import { map } from "./mixin";

export class WebDownloader extends Downloader {
	public constructor(conf: {paths?: {}}) {
		super(conf.paths || {});
	}

    protected download(url: string): Promise<Function> {
		var me = this;
		(<any>window).define = function() { return me.define.apply(me, arguments); };
		(<any>window).define.amd = true;
		url = url.indexOf("/") !== 0 && `/${url}` || url;
		var script = document.createElement('script');
		script.async = true;
		script.src = `${url}.js`;
		document.head.appendChild(script);
		return new Promise(resolve => {
			script.onload = (<any>script).onreadystatechange = () => {
				var last = this.last; 
				resolve((arg) => { 
					var setModule = arg.setModule;
					arg.setModule = (m) => { 
						m.value = m.value || m.module.apply(null, map(m.dependencies, (d: any) => { 
							return d.value || d === "require" && ((uri) => m.dependencies[m.uris.indexOf(uri)].value) || d; 
						})) || m.dependencies[m.uris.indexOf("exports")];
						return setModule(m); 
					}
					var res = last(arg); 
					return res;
				});
			};
		});
	}
}