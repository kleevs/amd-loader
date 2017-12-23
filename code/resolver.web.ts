import { Resolver } from "./resolver";

export class WebResolver extends Resolver {
    protected download(url: string): Promise<Function> {
		var tmp = (<any>window).define;
		(<any>window).define = () => this.define.apply(this, arguments);
		var script = document.createElement('script');
		script.async = true;
		script.src = `${url}.js`;
		document.head.appendChild(script);
		return new Promise(resolve => {
			script.onload = (<any>script).onreadystatechange = () => {
				(<any>window).define = tmp;
				resolve((arg) => this.last(arg));
			};
		});
	}
}