export class Earth {
    private static _vertice: number[] = [];
    private static _normal: number[] = [];
    private static _texcoord: number[] = [];
    private static _index: number[] = [];
    private static isInitialized: boolean = false;

    public static get vertice(): number[] {
        if (!this.isInitialized)
            throw Error("Mesh is not initialized.");
        return Earth._vertice;
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

                this._vertice.push(x, y, z);
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
        /*
        let kk = 0;
        for(let i = 0; i < stacks; ++i)
        {
            let k1 = i * (stacks + 1);            // beginning of current stack
            let k2 = k1 + stacks + 1;             // beginning of next stack

            for(let j=0; j < slices; ++j, ++k1, ++k2)
            {
                // 2 triangles per sector excluding 1st and last stacks
                if(i != 0)
                {
                    this._index.push(kk, k1, k2, k1+1);  // k1---k2---k1+1
                    kk += 3;
                }

                if(i != (stacks-1))
                {
                    this._index.push(kk, k1+1, k2, k2+1);// k1+1---k2---k2+1
                    kk += 3;
                }
            }
        }
        */
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
    /*
    public static create(radius: number, precision: number) {
        // 중심이 0,0,0이고 반지름이 radius인 구 생성
        for (let i  = 0; i < precision; i++) {
            let phi1 = i * Math.PI * 2 / precision;
            let phi2 = (i + 1) * Math.PI * 2 / precision;
            let x = 0, y = 0, z = 0; //vertices
            let nx = 0, ny = 0, nz = 0; //normals
            let u = 0, v = 0; //texcoords

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
    */
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
