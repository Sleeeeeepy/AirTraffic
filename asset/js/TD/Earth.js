export class Earth {
    static get vertex() {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Earth._vertex;
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
    static create(radius, stacks, sectors) {
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
                v = i / stacks;
                this._texcoord.push(u, v);
            }
        }
        this.createIndex(stacks, sectors);
        this.isInitialized = true;
    }
    static createIndex(stacks, sectors) {
        let k1, k2;
        for (let i = 0; i < stacks; i++) {
            k1 = i * (sectors + 1);
            k2 = k1 + sectors + 1;
            for (let j = 0; j < sectors; j++) {
                if (i != 0) {
                    this._index.push(k1, k2, k1 + 1);
                }
                if (i != (stacks - 1)) {
                    this._index.push(k1 + 1, k2, k2 + 1);
                }
                k1++;
                k2++;
            }
        }
    }
    static pointAt(radius, lat, lon) {
        let ret = [];
        lat += 180;
        let latRad = lat * (Math.PI / 180);
        let lonRad = lon * (Math.PI / 180);
        let x = Math.cos(latRad) * Math.cos(lonRad) * radius;
        let y = Math.cos(lonRad) * Math.sin(latRad) * radius;
        let z = Math.sin(lonRad) * radius;
        ret.push(x, y, z);
        return ret;
    }
    static lightPos(lat) {
        let ret = [];
        lat += 180;
        let latRad = lat * (Math.PI / 180);
        let x = Math.cos(latRad);
        let y = Math.sin(latRad);
        let z = 0;
        ret.push(x, y, z);
        return ret;
    }
    static lightPosTime(epoch) {
        let date = new Date(epoch);
        let h = date.getUTCHours();
        let min = date.getUTCMinutes();
        let sec = date.getUTCSeconds();
        let degree = h * 15.0 + min * 0.25 + sec * 0.00417 - 180;
        console.log("UTC", h, "시", min, "분", sec, "초", degree);
        console.log("KST", date.getHours(), "시", date.getMinutes(), "분", date.getSeconds(), "초", degree);
        return this.lightPos(-degree);
    }
}
Earth._vertex = [];
Earth._normal = [];
Earth._texcoord = [];
Earth._index = [];
Earth.isInitialized = false;
//# sourceMappingURL=Earth.js.map