module AMDLoader {
    export let baseUrl: string = ".";
    let modules: any = {};
    let current: Promise<any>;

    function map(array, parse) {
        let res = [];
        array.forEach((x) => { res.push(parse(x)); });
        return res;
    }

    function getUrl(uri: string): string {
        let result: string;
        if (uri) {
            let urlArray: string[] = (baseUrl + "/" + uri).replace(/\\/gi, "/").split("/");
            let i =  0;
            while(i < urlArray.length) {
                if (urlArray[i] === "..") {
                    urlArray[i-1] && urlArray[i-1] !== ".." &&
                    urlArray.splice(i-1, 2) && i--;
                } else if (urlArray[i] === "." || !urlArray[i]) {
                    urlArray.splice(i, 1);
                } else {
                    i++;
                }
            }

            result = urlArray.join("/"); 
        }

        return result;
    }

    export function load(uris: string[], callback: Function) {
        let array: any[] = [],
            exports,
            length = 0;

        uris.forEach((uri, index) => {      
            array[index] = create(uri);
            uri === "exports" && (exports = array[index]);
        });

        current = Promise.all(array).then((results) => {
            var module = callback.apply(null, results) || exports;
            return module;
        });
    }

    function get(name: string) {
        return modules[name] ? modules[name].module : (create(name), undefined);
    }

    export function create(uri: string): Promise<any> {
        var script = document.createElement('script'),
            name = getUrl(uri);

        if (modules[name]) return new Promise(resolve => resolve(get(name)));

        script.async = true;
        script.src = name + ".js";
        script.setAttribute("data-name", name);
        modules[name] = script;
        window.document.head.appendChild(script);
        return new Promise(resolve => {
            script.onload = (<any>script).onreadystatechange = () => {
                current && current.then((value) => {
                    (<any>script).module = value;
                    resolve(value);
                });
                !current && resolve();
            };
        });
    }

    (<any>window).define = load;
    (<any>window).define.amd = true;
    (<any>window).require = get;

    modules.require = { module: get };
    modules.exports = { get module() { return {}; } };
}