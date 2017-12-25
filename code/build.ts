import { NodeDownloader } from "./downloader.node";
import { Resolver } from "./resolver";
import { map } from "./mixin";

declare let define;
let resolver = new NodeDownloader();

function template(factory, root) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require"], (require) => factory(require));
    } else {
        factory(null, root);
    }
}

function unique(array: any[]): any[] {
    var res = [];
    array.forEach(m => res.indexOf(m) < 0 ? res.push(m) : "");
    return res;
}

function extract(module) {
    var modules = [];
    module && module.dependencies && module.dependencies.forEach((m) => {
        modules = unique(modules.concat(extract(m)));
    });
    module && module.module && modules.indexOf(module) < 0 && modules.push(module);
    return modules;
}

export function build(uri: string) : Promise<string> { 
    return resolver.resolve(uri).then((value) => {
        var modules = extract(value);
        var factory = new Function("req", `${[
            Resolver.toString(),
            `var resolver = new Resolver();`,
            `var names = [${map(modules, (m) => `"${m.uri}"`)}]`,
            `var res = [${Array.apply(null, Array(modules.length)).map(() => "{}").join(",")}];`,
            `var require = function(currentPath, name) { name = resolver.resolve(currentPath, name); return names.indexOf(name) >= 0 && res[names.indexOf(name)] || req(name); }`
        ].concat(map(modules, (m, idx) => {
            return m.dependencies && `${modules.length-1 === idx && "return " || ""}res[${idx}] = (${modules[idx].module.toString()})(${map(m.dependencies, (d, indexd) => {
                var i = modules.indexOf(d);
                if (i >= 0) {
                    return `res[${i}]`;
                } else if (m.uris[indexd] == "require") {
                    var tmp = m.uri.split("/");
					tmp[tmp.length-1] = "";
                    return `require.bind(null, "${tmp.join("/")}")`;
                } else if (m.uris[indexd] == "exports") {
                    return `res[${idx}]`;
                }
            })}) || res[${idx}];`;
        })).join("\r\n")}`);

        return `(${template.toString()})(${[
            factory.toString(),
            "typeof window !== 'undefined' && window || {}"
        ].join(", ")})`
    });
}