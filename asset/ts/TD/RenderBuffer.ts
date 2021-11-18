import {GL} from './GL.js'

export class RenderBuffer {
    private gl: WebGLRenderingContext = GL.instance;
    private renderBuffer: WebGLRenderbuffer | null;
    public constructor(internalFormat: number, width: number, height: number) {
        this.renderBuffer = this.gl.createRenderbuffer();
        if (!this.renderBuffer) {
            throw new Error("cannot create framebuffer.");
        }
        this.bind();
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, internalFormat, width, height);
    }

    public bind() {
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderBuffer);
    }
}