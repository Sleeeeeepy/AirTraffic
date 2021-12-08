export class Earth {
    private _vertex: number[] = [];
    private _normal: number[] = [];
    private _texcoord: number[] = [];
    private _mercatorTexcoord: number[] = [];
    private _index: number[] = [];
    
    public constructor(radius: number, stacks: number, sectors: number) {
        this.create(radius, stacks, sectors);
    }
    
    public get vertex(): number[] {
        return this._vertex;
    }

    public get normal(): number[] {
        return this._normal;
    }

    public get texcoord(): number[] {
        return this._texcoord;
    }

    public get mercatorTexcoord(): number[] {
        return this._mercatorTexcoord;
    }

    public get index(): number[] {
        return this._index;
    }

    // @http://www.songho.ca/opengl/gl_sphere.html
    private create(radius: number, stacks: number, sectors: number) {
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
                
                //uv map
                u = j / sectors;
                v = i / stacks; // or 1 - i / stack
                this._texcoord.push(u, v);
                
                //mercator projection to equirectangular projection
                //mercator                      equirectangular                uv
                //x = theta         <--->           x = theta       <---    x = 2pi * u
                //y = log_e(tan(pi/4+phi/2)) <--->  y = sin(phi)    <---    y = pi * (v - 0.5)
                //e is base of the natural logarithm.
                mu = u;
                mv = ((Math.log(Math.tan(Math.PI / 4.0 + (v - 0.5) * Math.PI / 2.0))) + Math.PI) / (2 * Math.PI); // normalize
                this._mercatorTexcoord.push(mu, mv);
            }
        }
        this.createIndex(stacks, sectors);
    }

    private createIndex(stacks: number, sectors: number) {
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
    
    public static pointAt(radius: number, lat: number, lon: number): number[] {
        let ret = [];
        lat += 180;
        let latRad = lat * (Math.PI / 180);
        let lonRad = lon * (Math.PI / 180);
        let x = Math.cos(latRad) * Math.cos(lonRad) * radius;
        let y = Math.cos(lonRad) * Math.sin(latRad) * radius;
        let z = Math.sin(lonRad) * radius;
        ret.push(x,y,z);
        return ret;
    }

    public static lightPos(lat: number): any[] {
        let ret = [];
        lat += 180;
        let latRad = lat * (Math.PI / 180);
        let x = Math.cos(latRad);
        let y = Math.sin(latRad);
        let z = 0;
        ret.push(x,y,z);
        return ret;
    }

    public static lightPosTime(epoch: number): any[] {
        let date;
        if (epoch > 0) {
            date = new Date(epoch);
        } else {
            date = new Date();
        }
        let h = date.getUTCHours();
        let min = date.getUTCMinutes();
        let sec = date.getUTCSeconds();

        let degree = h *  15.0 + min * 0.25 + sec * 0.00417;
        //console.log("UTC", h, "H", min, "M", sec, "S", degree, "degree");
        //console.log("Local", date.getHours(), "H", date.getMinutes(), "M", date.getSeconds(), "S", degree, "degree");
        return this.lightPos(-degree);
    }
}
