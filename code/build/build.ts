import { Loader } from './loader/abstract';
import { Transpiler } from './transpiler/abstract';
import { Dependencer } from './dependencer/abstract';
import { Bundlerify, Module } from './bundlerify/abstract';
import { Writer } from './writer/abstract';
import { DefaultLoader } from './loader/default';
import { DefaultTranspiler } from './transpiler/default';
import { DefaultDependencer } from './dependencer/default';
import { DefaultBundlerify} from './bundlerify/default';
import { DefaultWriter} from './writer/default';
import * as path from 'path';

export class Compiler {
    private options;
    constructor(options?) {
        var fileName = path.join(process.cwd(), "build.js");
        this.options = options || require(fileName);
    }

    apply(config?: { 
		loader?: typeof Loader,
		transpiler?: typeof Transpiler,
		dependencer?: typeof Dependencer,
		bundlerify?: typeof Bundlerify,
		writer?: typeof Writer
	}) {
        var options = this.options || {};
		var modules = {};
		
		var loader: Loader = new (<any>(config && config.loader || DefaultLoader))(options.config);
		var transpiler: Transpiler = new (<any>(config && config.transpiler || DefaultTranspiler))(options.config);
		var dependencer: Dependencer = new (<any>(config && config.dependencer || DefaultDependencer))(options.config);
		var bundlerify: Bundlerify = new (<any>(config && config.bundlerify || DefaultBundlerify))(options.config);
		var writer: Writer = new (<any>(config && config.writer || DefaultWriter))(options.config);
        
        function load(uri): Module {
			uri = path.normalize(uri).replace(/\\/gi, "/");
			if (modules[uri]) {
				return modules[uri];
			}
			
            var fileContent = loader && loader.load(uri);
			var content = transpiler && transpiler.transpile(uri, fileContent);
			var dependencies = dependencer && dependencer.getDependencies(uri, content) || [];
			var mdependencies = dependencies.map(dependency => load(dependency));
			return modules[uri] = { 
				id: uri,
				written: false,
				content: content, 
				dependencies: mdependencies
			};
        }

        var main = load(options.main);
        var result = bundlerify && bundlerify.bundle(main);
		writer.write(options.out, result);
    }
}
