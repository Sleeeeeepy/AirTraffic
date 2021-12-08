import { GL } from "./GL.js";
import { IRenderer } from "./IRenderer.js";
import { ShaderProgram } from "./ShaderProgram.js";
import { Buffer} from "./Buffer.js";

export class ArrayRenderer implements IRenderer {
    private gl: WebGLRenderingContext = GL.instance;
    private buffer: Buffer;
    private program: ShaderProgram;
    private drawMode: number
    private callback: () => void;
    private aftercallback: () => void;
    private stride: number = 3;

    public constructor(buffer: Buffer, stride: number, program: ShaderProgram, drawMode: number, callback: () => void, aftercallback: () => void) {
        this.buffer = buffer;
        this.stride = stride;
        this.program = program;
        this.drawMode = drawMode;
        this.callback = callback;
        this.aftercallback = aftercallback;
        callback.bind(this);
        aftercallback.bind(this);
    }

    public draw(): void {
        this.callback();
        this.buffer.bind();
        this.program.use();
        this.gl.drawArrays(this.drawMode, 0, this.buffer.length / this.stride);
        this.aftercallback();
    }
}