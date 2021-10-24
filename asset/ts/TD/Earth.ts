export class Earth {
    private static _vertex: number[] = [];
    private static _normal: number[] = [];
    private static _texcoord: number[] = [];
    private static _index: number[] = [];
    private static isInitialized: boolean = false;

    public static get vertex(): number[] {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Earth._vertex;
    }

    public static get normal(): number[] {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Earth._normal;
    }

    public static get texcoord(): number[] {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Earth._texcoord;
    }

    public static get index(): number[] {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Earth._index;
    }

    // @http://www.songho.ca/opengl/gl_sphere.html
    public static create(radius: number, stacks: number, sectors: number) {
        let phi, theta;
        let x, y, z;
        let nx, ny, nz;
        let u, v;
        let stack_step = Math.PI / stacks;
        let slice_step = 2 * Math.PI / sectors;

        for (let i = 0; i <= stacks; ++i) {
            phi = (Math.PI / 2) - stack_step * i;
            for (let j = 0; j <= sectors; ++j) {
                theta = j * slice_step;

                nx = Math.cos(phi) * Math.cos(theta);
                ny = Math.cos(phi) * Math.sin(theta);
                nz = Math.sin(phi);
                x = radius * nx;
                y = radius * ny;
                z = radius * nz;

                this._vertex.push(x, y, z);
                this._normal.push(nx, ny, nz);

                u = j / sectors;
                v = i / stacks; // or 1 - i / stack
                this._texcoord.push(u, v);
            }
        }
        this.createIndex(stacks, sectors);
        this.isInitialized = true;
    }

    private static createIndex(stacks: number, sectors: number) {
       let k1, k2;
       for (let i = 0; i < stacks; i++) {
           k1 = i * (sectors + 1);
           k2 = k1 + sectors + 1;
           for (let j = 0; j < sectors; j++) {
               if (i != 0) {
                   this._index.push(k1, k2, k1 + 1);
               }
               if (i != (stacks - 1)) {
                   this._index.push(k1+1, k2, k2+1);
               }
               k1++;
               k2++;
           }
       }
    }

    public static pointAt(radius: number, lon: number, lat: number): any[] {
        let ret = [];
        let latRad = lat * (Math.PI / 180);
        let lonRad= -lon * (Math.PI / 180);
        let x = Math.cos(latRad) * Math.cos(lonRad) * radius;
        let y = Math.sin(latRad) * radius;
        let z = Math.cos(latRad) * Math.sin(lonRad) * radius
        ret.push(x,y,z);
        return ret;
    }
}
