export class Resolver {
	public constructor(private paths = {}) {}

	public resolve (path: string, uri: string) {
		var paths = this.paths;
		path = (path ? [path] : []).concat([uri]).join("/");
		var array = (path || "").replace(/\\/gi, "/").split("/");
		var i;
	
		uri = uri.replace(/\\/gi, "/");
		for (i in paths) {
			if (uri.indexOf(`${i}/`) === 0) {
				return uri.replace(i, paths[i]);
			}
		}
		
		for (i=0; i<array.length; i++) {
			if (!array[i] && i > 0) array.splice(i, 1) && i--;
			else if (array[i] === ".") array.splice(i, 1) && i--;
			else if (array[i] === ".." && i > 0 && array[i-1] !== ".." && array[i-1]) array.splice(i-1, 2) && (i-=2);            
		}
	
		return array.join("/");
	}
}