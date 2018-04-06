export type Module = { id: string; content: string, dependencies: Module[], written: boolean };

export abstract class Bundlerify {
    abstract bundle(main: Module): string
}
