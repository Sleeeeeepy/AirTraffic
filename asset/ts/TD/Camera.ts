import mat4 from '../tsm/mat4.js';
import vec3 from '../tsm/vec3.js';
import {GL} from './GL.js';

export class Camera {
    private _aspect: number;
    private _near: number;
    private _far: number;
    private _proMatrix: mat4;
    private _pov: number;

    public constructor(pov: number, aspect: number, near: number, far: number) {
        this._aspect = aspect;
        this._near = near;
        this._far = far;
        this._pov = pov;
        this._proMatrix = mat4.perspective(pov, aspect, near, far);
    }

    public get aspect(): number {
        return this._aspect;
    }

    public set aspect(value: number) {
        this._aspect = value;
        this._proMatrix = mat4.perspective(this.pov, this._aspect, this.near, this.far);
    }

    public get near(): number {
        return this._near;
    }

    public set near(value: number) {
        this._near = value;
        this._proMatrix = mat4.perspective(this.pov, this._aspect, this.near, this.far);
    }

    public get far(): number {
        return this._far;
    }

    public set far(value: number) {
        this._far = value;
        this._proMatrix = mat4.perspective(this.pov, this._aspect, this.near, this.far);
    }

    public get proMatrix(): mat4 {
        return this._proMatrix;
    }

    public get pov(): number {
        return this._pov;
    }

    public set pov(value: number) {
        this._pov = value;
        this._proMatrix = mat4.perspective(this.pov, this._aspect, this.near, this.far);
    }
}