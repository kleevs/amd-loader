var AMDLoader;
(function (AMDLoader) {
    AMDLoader.baseUrl = ".";
    let modules = {};
    let current;
    function map(array, parse) {
        let res = [];
        array.forEach((x) => { res.push(parse(x)); });
        return res;
    }
    function getUrl(uri) {
        let result;
        if (uri) {
            let urlArray = (AMDLoader.baseUrl + "/" + uri).replace(/\\/gi, "/").split("/");
            let i = 0;
            while (i < urlArray.length) {
                if (urlArray[i] === "..") {
                    urlArray[i - 1] && urlArray[i - 1] !== ".." &&
                        urlArray.splice(i - 1, 2) && i--;
                }
                else if (urlArray[i] === "." || !urlArray[i]) {
                    urlArray.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            result = urlArray.join("/");
        }
        return result;
    }
    function load(uris, callback) {
        let array = [], exports, length = 0;
        uris.forEach((uri, index) => {
            array[index] = create(uri);
            uri === "exports" && (exports = array[index]);
        });
        current = Promise.all(array).then((results) => {
            var module = callback.apply(null, results) || exports;
            return module;
        });
    }
    AMDLoader.load = load;
    function get(name) {
        return modules[name] ? modules[name].module : (create(name), undefined);
    }
    function create(uri) {
        var script = document.createElement('script'), name = getUrl(uri);
        if (modules[name])
            return new Promise(resolve => resolve(get(name)));
        script.async = true;
        script.src = name + ".js";
        script.setAttribute("data-name", name);
        modules[name] = script;
        window.document.head.appendChild(script);
        return new Promise(resolve => {
            script.onload = script.onreadystatechange = () => {
                current && current.then((value) => {
                    script.module = value;
                    resolve(value);
                });
                !current && resolve();
            };
        });
    }
    AMDLoader.create = create;
    window.define = load;
    window.define.amd = true;
    window.require = get;
    modules.require = { module: get };
    modules.exports = { get module() { return {}; } };
})(AMDLoader || (AMDLoader = {}));
//# sourceMappingURL=index.js.map