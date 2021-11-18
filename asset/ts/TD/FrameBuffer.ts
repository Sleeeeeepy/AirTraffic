import {GL} from './GL.js'

export class FrameBuffer {
    private gl: WebGLRenderingContext = GL.instance;
    private frameBuffer: WebGLFramebuffer | null;
    public constructor() {
        this.frameBuffer = this.gl.createFramebuffer();
        if (!this.frameBuffer) {
            throw new Error("cannot create framebuffer.");
        }
    }

    public bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    }
}