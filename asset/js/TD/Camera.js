import mat4 from '../tsm/mat4.js';
import quat from '../tsm/quat.js';
import vec3 from '../tsm/vec3.js';
export class Camera {
    constructor(fov, aspect, near, far, orbit, zoom, target, adjustFar) {
        this._orbit = 100;
        this._zoom = 1.0;
        this._up = new vec3([0, 1, 0]);
        this.isUpdated = false;
        this._adjustFar = false;
        this._quat = new quat([0, 0, 0, 1]);
        this._aspect = aspect;
        this._near = near;
        this._far = far;
        this._fov = fov;
        this._projectionMatrix = mat4.perspective(fov, aspect, near, far);
        this._orbit = orbit;
        this._zoom = zoom;
        this._target = target;
        this._adjustFar = adjustFar;
        this._viewMatrix = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        this._worldMatrix = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        this._cameraPosition = new vec3([0, 0, 0]);
        this.updateCameraMatrix();
    }
    get cameraPosition() {
        let mat = this.viewMatrix.copy();
        mat = mat.multiply(this.worldMatrix.copy());
        let ret = new vec3([mat.at(12), mat.at(13), mat.at(14)]);
        return ret;
    }
    get aspect() {
        return this._aspect;
    }
    set aspect(value) {
        this._aspect = value;
        this._projectionMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
        this.isUpdated = true;
    }
    get near() {
        return this._near;
    }
    set near(value) {
        this._near = value;
        this._projectionMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
        this.isUpdated = true;
    }
    get far() {
        return this._far;
    }
    set far(value) {
        this._far = value;
        this._projectionMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
        this.isUpdated = true;
    }
    get projectionMatrix() {
        if (this.isUpdated) {
            this.updateCameraMatrix();
        }
        return this._projectionMatrix;
    }
    get fov() {
        return this._fov;
    }
    set fov(value) {
        this._fov = value;
        this._projectionMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
        this.isUpdated = true;
    }
    get orbit() {
        return this._orbit;
    }
    set orbit(value) {
        this._orbit = value;
        this.isUpdated = true;
    }
    get zoom() {
        return this._zoom;
    }
    set zoom(value) {
        this._zoom = value;
        this.isUpdated = true;
        if (this._adjustFar) {
            this.far = this._orbit / this.zoom;
        }
    }
    get worldMatrix() {
        if (this.isUpdated) {
            this.updateCameraMatrix();
        }
        return this._worldMatrix;
    }
    get viewMatrix() {
        if (this.isUpdated) {
            this.updateCameraMatrix();
        }
        return this._viewMatrix;
    }
    updateCameraMatrix() {
        let cameraMatrix = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        cameraMatrix.rotate(Math.PI / 2, new vec3([1, 0, 0]));
        cameraMatrix.translate(new vec3([0, 0, this._orbit / this._zoom]));
        let campos = new vec3([cameraMatrix.at(12), cameraMatrix.at(13), cameraMatrix.at(14)]);
        cameraMatrix = mat4.lookAt(campos, this._target, this._up);
        this._viewMatrix = cameraMatrix.copy();
        this.isUpdated = false;
    }
    initWorldMatrix() {
        this._worldMatrix = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        this.isUpdated = true;
    }
    RotateX(radian) {
        if (radian == 0)
            return;
        this._worldMatrix.rotate(radian, Camera._xAxis);
        this.isUpdated = true;
    }
    RotateY(radian) {
        if (radian == 0)
            return;
        this._worldMatrix.rotate(radian, Camera._yAxis);
        this.isUpdated = true;
    }
    RotateZ(radian) {
        if (radian == 0)
            return;
        this._worldMatrix.rotate(radian, Camera._zAxis);
        this.isUpdated = true;
    }
    objectRotateQuatFromEulerAngle(Xradian, Yradian, Zradian) {
        Xradian /= 2;
        Yradian /= 2;
        Zradian /= 2;
        let x = Math.sin(Xradian) * Math.cos(Yradian) * Math.cos(Zradian) + Math.cos(Xradian) * Math.sin(Yradian) * Math.sin(Zradian);
        let y = Math.cos(Xradian) * Math.sin(Yradian) * Math.cos(Zradian) - Math.sin(Xradian) * Math.cos(Yradian) * Math.sin(Zradian);
        let z = Math.cos(Xradian) * Math.cos(Yradian) * Math.sin(Zradian) + Math.sin(Xradian) * Math.sin(Yradian) * Math.cos(Zradian);
        let w = Math.cos(Xradian) * Math.cos(Yradian) * Math.cos(Zradian) - Math.sin(Xradian) * Math.sin(Yradian) * Math.sin(Zradian);
        this._quat = new quat([x, y, z, w]);
        this._worldMatrix = this._quat.toMat4().multiply(this.worldMatrix.copy());
    }
}
Camera._xAxis = new vec3([1, 0, 0]);
Camera._yAxis = new vec3([0, 1, 0]);
Camera._zAxis = new vec3([0, 0, 1]);
//# sourceMappingURL=Camera.js.map