import { Loader } from './loader/abstract';
import { Transpiler } from './transpiler/abstract';
import { Dependencer } from './dependencer/abstract';
import { Bundlerify } from './bundlerify/abstract';
import { Writer } from './writer/abstract';
export declare class Compiler {
    private options;
    constructor(options?: any);
    apply(config?: {
        loader?: typeof Loader;
        transpiler?: typeof Transpiler;
        dependencer?: typeof Dependencer;
        bundlerify?: typeof Bundlerify;
        writer?: typeof Writer;
    }): void;
}
