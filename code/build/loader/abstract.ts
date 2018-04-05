export abstract class Loader {
    abstract match(id: string): boolean;
    abstract load(id: string): { content: string, dependencies: string[]}
}
