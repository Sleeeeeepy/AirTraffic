import { GL } from './GL.js';
export class FrameBuffer {
    constructor() {
        this.gl = GL.instance;
        this.frameBuffer = this.gl.createFramebuffer();
        if (!this.frameBuffer) {
            throw new Error("cannot create framebuffer.");
        }
    }
    bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    }
    unbind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    getWebGLFrameBuffer() {
        if (this.frameBuffer) {
            return this.frameBuffer;
        }
        throw new Error("Fail to get framebuffer.");
    }
    setTexture2D(texture) {
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture.getWebGLTexture(), 0);
    }
    setRenderBufferDepthAttachment(renderBuffer) {
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, renderBuffer.getWebGLRenderBuffer());
    }
}
//# sourceMappingURL=FrameBuffer.js.map