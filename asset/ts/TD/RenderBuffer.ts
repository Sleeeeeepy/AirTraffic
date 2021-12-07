import {GL} from './GL.js'

export class RenderBuffer {
    private gl: WebGLRenderingContext = GL.instance;
    private renderBuffer: WebGLRenderbuffer | null;
    public constructor() {
        this.renderBuffer = this.gl.createRenderbuffer();
        if (!this.renderBuffer) {
            throw new Error("cannot create framebuffer.");
        }
    }

    public bind() {
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderBuffer);
    }

    public unbind() {
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
    }

    public storage(internalFormat: number, width: number, height: number) {
        this.bind();
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, internalFormat, width, height);
    }

    public getWebGLRenderBuffer() {
        return this.renderBuffer;
    }
}