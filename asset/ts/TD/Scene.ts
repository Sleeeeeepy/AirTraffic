import { Buffer } from "./Buffer";
import { GL } from "./GL";
import { ShaderProgram } from "./ShaderProgram";

enum DrawType {
    Array,
    Index
}
export interface IRenderer {
    draw(): void
}

export class DrawRenderer implements IRenderer {
    private gl: WebGLRenderingContext = GL.instance;
    private buffer: Buffer;
    private program: ShaderProgram;
    private drawType: DrawType;
    private drawMode: number
    private callback: () => void;

    public constructor(buffer: Buffer, program: ShaderProgram, drawType: DrawType, drawMode: number, callback: () => void) {
        this.buffer = buffer;
        this.program = program;
        this.drawType = drawType;
        this.drawMode = drawMode;
        this.callback = callback;
    }

    public draw(): void {
        this.callback();
        this.buffer.bind();
        this.program.use();
        if (this.drawType == DrawType.Array) {
            this.gl.drawArrays(this.drawMode, 0, this.buffer.length);
        } else {
            this.gl.drawElements(this.drawMode, this.buffer.length, this.gl.UNSIGNED_SHORT, 0);
        }
    }
}

export class Scene implements IRenderer {
    private renderers: IRenderer[]
    
    public constructor() {
        this.renderers = new Array<IRenderer>();
    }

    public addRenderer(renderer: IRenderer) {
        this.renderers.push(renderer);
    }

    public draw(): void {
        for (let r in this.renderers) {
            this.renderers[r].draw();
        }
    }
    
    public requestAnimation(): void {
        requestAnimationFrame(this.draw);
    }
}