import mat4 from '../tsm/mat4.js';
import vec3 from '../tsm/vec3.js';
export class Camera {
    constructor(fov, aspect, near, far, orbit, zoom) {
        this._orbit = 100;
        this._zoom = 1.0;
        this._aspect = aspect;
        this._near = near;
        this._far = far;
        this._fov = fov;
        this._proMatrix = mat4.perspective(fov, aspect, near, far);
        this._rotateMatrix = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        this._orbit = orbit;
        this._zoom = zoom;
        this._cameraMatrix = this.initCameraMatrix(Math.PI / 2, new vec3([1, 0, 0]));
    }
    get aspect() {
        return this._aspect;
    }
    set aspect(value) {
        this._aspect = value;
        this._proMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
    }
    get near() {
        return this._near;
    }
    set near(value) {
        this._near = value;
        this._proMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
    }
    get far() {
        return this._far;
    }
    set far(value) {
        this._far = value;
        this._proMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
    }
    get proMatrix() {
        return this._proMatrix;
    }
    get fov() {
        return this._fov;
    }
    set fov(value) {
        this._fov = value;
        this._proMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
    }
    get orbit() {
        return this._orbit;
    }
    set orbit(value) {
        this._orbit = value;
    }
    get zoom() {
        return this._zoom;
    }
    set zoom(value) {
        this._zoom = value;
        this._cameraMatrix = this.initCameraMatrix(Math.PI / 2, new vec3([1, 0, 0]));
    }
    get cameraMatrix() {
        return this._cameraMatrix;
    }
    get rotateMatrix() {
        return this._rotateMatrix;
    }
    initCameraMatrix(radian, axis) {
        let cameraMatrix = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        cameraMatrix.rotate(radian, axis);
        cameraMatrix.translate(new vec3([0, 0, this._orbit / this._zoom]));
        let InverseCameraTransform = cameraMatrix.copy().inverse();
        let CameraProjection = this._proMatrix.copy();
        let uCameraMatrix = CameraProjection.multiply(InverseCameraTransform);
        return uCameraMatrix;
    }
    RotateX(radian) {
        this._rotateMatrix.rotate(radian, Camera._xAxis);
    }
    RotateY(radian) {
        this._rotateMatrix.rotate(radian, Camera._yAxis);
    }
    RotateZ(radian) {
        this._rotateMatrix.rotate(radian, Camera._zAxis);
    }
}
Camera._xAxis = new vec3([1, 0, 0]);
Camera._yAxis = new vec3([0, 1, 0]);
Camera._zAxis = new vec3([0, 0, 1]);
//# sourceMappingURL=Camera.js.map