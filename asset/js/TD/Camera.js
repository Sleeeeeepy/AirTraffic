import mat4 from '../tsm/mat4.js';
export class Camera {
    constructor(pov, aspect, near, far) {
        this._aspect = aspect;
        this._near = near;
        this._far = far;
        this._pov = pov;
        this._proMatrix = mat4.perspective(pov, aspect, near, far);
    }
    get aspect() {
        return this._aspect;
    }
    set aspect(value) {
        this._aspect = value;
        this._proMatrix = mat4.perspective(this.pov, this._aspect, this.near, this.far);
    }
    get near() {
        return this._near;
    }
    set near(value) {
        this._near = value;
        this._proMatrix = mat4.perspective(this.pov, this._aspect, this.near, this.far);
    }
    get far() {
        return this._far;
    }
    set far(value) {
        this._far = value;
        this._proMatrix = mat4.perspective(this.pov, this._aspect, this.near, this.far);
    }
    get proMatrix() {
        return this._proMatrix;
    }
    get pov() {
        return this._pov;
    }
    set pov(value) {
        this._pov = value;
        this._proMatrix = mat4.perspective(this.pov, this._aspect, this.near, this.far);
    }
}
//# sourceMappingURL=Camera.js.map