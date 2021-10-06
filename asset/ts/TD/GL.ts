//GL Singleton
export class GL {
    private static _instance: WebGL2RenderingContext;
    private static canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gl_canvas");

    private constructor() { }

    public static get instance(): WebGL2RenderingContext {
        return this._instance ?? (this._instance = this.createGL(this.canvas));
    }

    private static createGL(canvas: HTMLCanvasElement): WebGL2RenderingContext {
        let gl = canvas.getContext("webgl2");
        if (!gl) {
            throw new Error("Fail to initialize WebGL");
        }
        return gl;
    }
}

