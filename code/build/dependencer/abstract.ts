export abstract class Dependencer {
    abstract getDependencies(id: string, content: string): string[]
}
