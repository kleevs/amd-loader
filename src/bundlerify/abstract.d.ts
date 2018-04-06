export declare type Module = {
    id: string;
    content: string;
    dependencies: Module[];
    written: boolean;
};
export declare abstract class Bundlerify {
    abstract bundle(main: Module): string;
}
