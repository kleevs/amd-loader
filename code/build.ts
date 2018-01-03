import { NodeDownloader } from "./downloader.node";
import { Resolver } from "./resolver";
import { map } from "./mixin";

declare let define, __decorate, __metadata;

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

export function build(uri: string, config: { name?: string, paths?: any, ignores?: any}) : Promise<string> {
    let resolver = new NodeDownloader(config && config.paths || {}, config && config.ignores || {});
    return resolver.resolve(uri).then((value) => {
        var modules = extract(value);
        var factory = new Function("req", `${[
            Resolver.toString(),
            `var resolver = new Resolver(${config && config.paths && JSON.stringify(config.paths) || "{}"});`,
            `var names = [${map(modules, (m) => `"${m.uri}"`)}]`,
            `var res = [${Array.apply(null, Array(modules.length)).map(() => "{}").join(",")}];`,
            `var require = function(currentPath, name) { var n = resolver.resolve(currentPath, name); return names.indexOf(n) >= 0 && res[names.indexOf(n)] || req(name); }`
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

        return `${Object.keys(resolver.global).map(key => 
            resolver.global[key] && `var ${key} = (this && this.${key}) || ${resolver.global[key].toString()};` || undefined)
                .join("\r\n")}(${template.toString()})(${[
            factory.toString(),
            `typeof window !== 'undefined' && (window${
                config && config && config.name && ("." + config.name + " = {}") || "" 
            }) || {}`
        ].join(", ")})`
    });
}