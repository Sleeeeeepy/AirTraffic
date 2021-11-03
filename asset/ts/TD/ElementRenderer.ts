import { GL } from "./GL.js";
import { IRenderer } from "./IRenderer.js";
import { ShaderProgram } from "./ShaderProgram.js";
import { Buffer } from "./Buffer.js";

export class ElementRenderer implements IRenderer {
    private gl: WebGLRenderingContext = GL.instance;
    private buffer: Buffer;
    private program: ShaderProgram;
    private drawMode: number
    private callback: () => void;

    public constructor(buffer: Buffer, program: ShaderProgram, drawMode: number, callback: () => void) {
        this.buffer = buffer;
        this.program = program;
        this.drawMode = drawMode;
        this.callback = callback;
        callback.bind(this);
    }

    public draw(): void {
        this.callback();
        this.buffer.bind();
        this.program.use();
        this.gl.drawElements(this.drawMode, this.buffer.length, this.gl.UNSIGNED_SHORT, 0);
    }
}