import { GL } from './GL.js';
export class RenderBuffer {
    constructor() {
        this.gl = GL.instance;
        this.renderBuffer = this.gl.createRenderbuffer();
        if (!this.renderBuffer) {
            throw new Error("cannot create framebuffer.");
        }
    }
    bind() {
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderBuffer);
    }
    unbind() {
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
    }
    storage(internalFormat, width, height) {
        this.bind();
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, internalFormat, width, height);
    }
    getWebGLRenderBuffer() {
        return this.renderBuffer;
    }
}
//# sourceMappingURL=RenderBuffer.js.map