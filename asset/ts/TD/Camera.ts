import mat4 from '../tsm/mat4.js';
import quat from '../tsm/quat.js';
import vec3 from '../tsm/vec3.js';
import {GL} from './GL.js';

export class Camera {
    private _aspect: number;
    private _near: number;
    private _far: number;
    private _fov: number;
    private _orbit: number = 100;
    private _zoom: number = 1.0;
    private _target: vec3;
    private _cameraPosition: vec3;
    private _viewMatrix: mat4;
    private _worldMatrix: mat4;
    private _projectionMatrix: mat4;
    private _up: vec3 = new vec3([0, 1, 0]);
    private isUpdated: boolean = false;
    private _adjustFar = false;
    private _quat: quat = new quat([0, 0, 0, 1]);
    private static readonly _xAxis: vec3 = new vec3([1, 0, 0]);
    private static readonly _yAxis: vec3 = new vec3([0, 1, 0]);
    private static readonly _zAxis: vec3 = new vec3([0, 0, 1]);
    
    public constructor(fov: number, aspect: number, near: number, far: number, orbit: number, zoom: number, target: vec3, adjustFar: boolean) {
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
    
    public get cameraPosition(): vec3 | undefined {
        let mat = this.viewMatrix.copy();
        mat = mat.multiply(this.worldMatrix.copy());
        let ret = new vec3([mat.at(12), mat.at(13), mat.at(14)])
        return ret;
    }

    public get aspect(): number {
        return this._aspect;
    }

    public set aspect(value: number) {
        this._aspect = value;
        this._projectionMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
        this.isUpdated = true;
    }

    public get near(): number {
        return this._near;
    }

    public set near(value: number) {
        this._near = value;
        this._projectionMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
        this.isUpdated = true;
    }

    public get far(): number {
        return this._far;
    }

    public set far(value: number) {
        this._far = value;
        this._projectionMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
        this.isUpdated = true;
    }

    public get projectionMatrix(): mat4 {
        if (this.isUpdated) {
            this.updateCameraMatrix();
        }
        return this._projectionMatrix;
    }

    public get fov(): number {
        return this._fov;
    }

    public set fov(value: number) {
        this._fov = value;
        this._projectionMatrix = mat4.perspective(this.fov, this._aspect, this.near, this.far);
        this.isUpdated = true;
    }

    public get orbit(): number {
        return this._orbit;
    }

    public set orbit(value: number) {
        this._orbit = value;
        this.isUpdated = true;
    }

    public get zoom(): number{
        return this._zoom;
    }

    public set zoom(value: number) {
        this._zoom = value;
        this.isUpdated = true;
        if (this._adjustFar) {
            this.far = this._orbit / this.zoom;
        }
    }

    public get worldMatrix() {
        if (this.isUpdated) {
            this.updateCameraMatrix();
        }
        return this._worldMatrix;
    }

    public get viewMatrix() {
        if (this.isUpdated) {
            this.updateCameraMatrix();
        }
        return this._viewMatrix;
    }

    private updateCameraMatrix() {
        let cameraMatrix = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1]);
        cameraMatrix.rotate(Math.PI/2, new vec3([1, 0, 0]));
        cameraMatrix.translate(new vec3([0, 0, this._orbit / this._zoom]));
        let campos = new vec3([cameraMatrix.at(12), cameraMatrix.at(13), cameraMatrix.at(14)]);
        cameraMatrix = mat4.lookAt(campos, this._target, this._up);
        this._viewMatrix = cameraMatrix.copy();
        this.isUpdated = false;
        
    }

    public initWorldMatrix() {
        this._worldMatrix = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        this.isUpdated = true;
    }

    // rotate with X axis
    public RotateX(radian: number) {
        if (radian == 0) return;
        this._worldMatrix.rotate(radian, Camera._xAxis);
        this.isUpdated = true;
    }

    // rotate with Y axis
    public RotateY(radian: number) {
        if (radian == 0) return;
        this._worldMatrix.rotate(radian, Camera._yAxis);
        this.isUpdated = true;
    }

    // rotate with Z axis
    public RotateZ(radian: number) {
        if (radian == 0) return;
        this._worldMatrix.rotate(radian, Camera._zAxis);
        this.isUpdated = true;
    }

    // rotate using quaternion with euler angle.
    // x->y->z
    public objectRotateQuatFromEulerAngle(Xradian: number, Yradian: number, Zradian: number) {
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
    /*
    public RotateQuat(axis: vec3, radian: number) {
        let x = axis.x * Math.sin(radian / 2);
        let y = axis.y * Math.sin(radian / 2);
        let z = axis.z * Math.sin(radian / 2);
        let w = Math.cos(radian / 2);
        this._quat = new quat([x, y, z, w]);
        this._worldMatrix = this._quat.toMat4(this.worldMatrix.copy());
    }
    */
}