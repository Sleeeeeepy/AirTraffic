export class Mesh {
    private static _vertice: number[] = [];
    private static _normal: number[] = [];
    private static _texcoord: number[] = [];
    private static _index: number[] = [];
    private static isInitialized: boolean = false;
    public static get vertice(): number[] {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Mesh._vertice;
    }

    public static get normal(): number[] {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Mesh._normal;
    }

    public static get texcoord(): number[] {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Mesh._texcoord;
    }

    public static get index(): number[] {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Mesh._index;
    }

    public static initialize(radius: number) {

    }
}
