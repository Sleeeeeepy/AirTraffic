import mat4 from '../tsm/mat4.js';
import vec3 from '../tsm/vec3.js';
import {GL} from './GL.js';

export class Camera {
    private _aspect: number;
    private _near: number;
    private _far: number;
    private _proMatrix: mat4;
    private _fov: number;
    private _orbit: number = 100;
    private _zoom: number = 1.0;
    private _cameraMatrix: mat4;
    private _rotateMatrix: mat4;
    private static readonly _xAxis: vec3 = new vec3([1, 0, 0]);
    private static readonly _yAxis: vec3 = new vec3([0, 1, 0]);
    private static readonly _zAxis: vec3 = new vec3([0, 0, 1]);

    public constructor(fov: number, aspect: number, near: number, far: number, orbit: number, zoom: number) {
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

    public get aspect(): number {
        return this._aspect;
    }

    public set aspect(value: number) {
        this._aspect = value;
        this._proMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
    }

    public get near(): number {
        return this._near;
    }

    public set near(value: number) {
        this._near = value;
        this._proMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
    }

    public get far(): number {
        return this._far;
    }

    public set far(value: number) {
        this._far = value;
        this._proMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
    }

    public get proMatrix(): mat4 {
        return this._proMatrix;
    }

    public get fov(): number {
        return this._fov;
    }

    public set fov(value: number) {
        this._fov = value;
        this._proMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
    }

    public get orbit(): number {
        return this._orbit;
    }

    public set orbit(value: number) {
        this._orbit = value;
    }

    public get zoom(): number{
        return this._zoom;
    }

    public set zoom(value: number) {
        this._zoom = value;
        this._cameraMatrix = this.initCameraMatrix(Math.PI / 2, new vec3([1, 0, 0]));
    }

    public get cameraMatrix() {
        return this._cameraMatrix;
    }

    public get rotateMatrix() {
        return this._rotateMatrix;
    }

    private initCameraMatrix(radian: number, axis: vec3): mat4 {
        let cameraMatrix = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1]);
        cameraMatrix.rotate(radian, axis);
        cameraMatrix.translate(new vec3([0, 0, this._orbit / this._zoom]));
        let InverseCameraTransform = cameraMatrix.copy().inverse();
        let CameraProjection = this._proMatrix.copy();
        let uCameraMatrix = CameraProjection.multiply(InverseCameraTransform);
        return uCameraMatrix;
    }

    public RotateX(radian: number) {
        this._rotateMatrix.rotate(radian, Camera._xAxis);
    }

    public RotateY(radian: number) {
        this._rotateMatrix.rotate(radian, Camera._yAxis);
    }

    public RotateZ(radian: number) {
        this._rotateMatrix.rotate(radian, Camera._zAxis);
    }
}