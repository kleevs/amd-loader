export abstract class Transpiler {
    abstract transpile(id: string, content: string): string
}
