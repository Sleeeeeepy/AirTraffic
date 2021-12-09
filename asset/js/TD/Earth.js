export class Earth {
    constructor(radius, stacks, sectors) {
        this._vertex = [];
        this._normal = [];
        this._texcoord = [];
        this._mercatorTexcoord = [];
        this._index = [];
        this.create(radius, stacks, sectors);
    }
    get vertex() {
        return this._vertex;
    }
    get normal() {
        return this._normal;
    }
    get texcoord() {
        return this._texcoord;
    }
    get mercatorTexcoord() {
        return this._mercatorTexcoord;
    }
    get index() {
        return this._index;
    }
    create(radius, stacks, sectors) {
        let phi, theta;
        let x, y, z;
        let nx, ny, nz;
        let u, v, mu, mv;
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
                mu = u;
                mv = ((Math.log(Math.tan(Math.PI / 4.0 + (v - 0.5) * Math.PI / 2.0))) + Math.PI) / (2 * Math.PI);
                this._mercatorTexcoord.push(mu, mv);
            }
        }
        this.createIndex(stacks, sectors);
    }
    createIndex(stacks, sectors) {
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
        let date;
        if (epoch > 0) {
            date = new Date(epoch);
        }
        else {
            date = new Date();
        }
        let h = date.getUTCHours();
        let min = date.getUTCMinutes();
        let sec = date.getUTCSeconds();
        let degree = h * 15.0 + min * 0.25 + sec * 0.00417;
        return this.lightPos(-degree);
    }
}
//# sourceMappingURL=Earth.js.map