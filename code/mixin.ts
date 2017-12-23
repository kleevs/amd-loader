export function normalizePath (paths, path: string, uri: string) {
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

export function map<T1, T2>(array: T1[], parse: (x: T1, index?: number) => T2): T2[] {
    let res = [];
    array.forEach((x, i) => { var y = parse(x, i); y !== undefined && res.push(y); });
    return res;
}