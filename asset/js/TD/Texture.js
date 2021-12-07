import { GL } from './GL.js';
export class Texture {
    constructor() {
        this.gl = GL.instance;
        this.textrue = this.gl.createTexture();
        this.create();
    }
    create() {
        if (this.textrue) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textrue);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            return;
        }
        throw new Error("Fail to create texture.");
    }
    getWebGLTexture() {
        if (this.textrue) {
            return this.textrue;
        }
        throw new Error("Fail to get texture.");
    }
    bind() {
        if (this.textrue) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textrue);
        }
    }
    unbind() {
        if (this.textrue) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
    }
    texImage2D(x, y, pixel) {
        this.bind();
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, x, y, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixel);
    }
}
//# sourceMappingURL=Texture.js.map