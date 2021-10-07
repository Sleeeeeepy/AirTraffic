export class GL {
    constructor() { }
    static get instance() {
        var _a;
        return (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = this.createGL(this.canvas));
    }
    static createGL(canvas) {
        let gl = canvas.getContext("webgl2");
        if (!gl) {
            throw new Error("Fail to initialize WebGL");
        }
        return gl;
    }
}
GL.canvas = document.getElementById("gl_canvas");
//# sourceMappingURL=GL.js.map