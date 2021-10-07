export class Earth {
    static get vertice() {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Earth._vertice;
    }
    static get normal() {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Earth._normal;
    }
    static get texcoord() {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Earth._texcoord;
    }
    static get index() {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Earth._index;
    }
    static create(radius, precision) {
        for (let i = 0; i < precision; i++) {
            let phi1 = i * Math.PI * 2 / precision;
            let phi2 = (i + 1) * Math.PI * 2 / precision;
            let x = 0, y = 0, z = 0;
            let nx = 0, ny = 0, nz = 0;
            let u = 0, v = 0;
            for (let j = 0; j <= precision; j++) {
                let theta = j * Math.PI / precision;
                nx = Math.sin(theta) * Math.cos(phi2);
                ny = Math.sin(theta) * Math.sin(phi2);
                nz = Math.cos(theta);
                x = radius * nx;
                y = radius * ny;
                z = radius * nz;
                this._vertice.push(x, y, z);
                this._normal.push(nx, ny, nz);
                nx = Math.sin(theta) * Math.cos(phi1);
                ny = Math.sin(theta) * Math.sin(phi1);
                nz = Math.cos(theta);
                x = radius * nx;
                y = radius * ny;
                z = radius * nz;
                this._vertice.push(x, y, z);
                this._normal.push(nx, ny, nz);
                u = phi1 / 2 * Math.PI;
                v = 1 - theta / Math.PI;
                this._texcoord.push(u, v);
            }
        }
        this.isInitialized = true;
    }
}
Earth._vertice = [];
Earth._normal = [];
Earth._texcoord = [];
Earth._index = [];
Earth.isInitialized = false;
//# sourceMappingURL=Earth.js.map