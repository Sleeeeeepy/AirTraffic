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

    public constructor(pov: number, aspect: number, near: number, far: number) {
        this._aspect = aspect;
        this._near = near;
        this._far = far;
        this._fov = pov;
        this._proMatrix = mat4.perspective(pov, aspect, near, far);
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
    }

    public getCameraMatrix(radian: number, axis: vec3): mat4 {
        let cameraMatrix = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1]);
        cameraMatrix.rotate(radian, axis);
        cameraMatrix.translate(new vec3([0, 0, this._orbit / this._zoom]));
        let InverseCameraTransform = cameraMatrix.copy().inverse();
        let CameraProjection = this._proMatrix;
        let uCameraMatrix = CameraProjection.multiply(InverseCameraTransform);
        return uCameraMatrix;
    }
}