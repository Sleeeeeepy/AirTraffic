import {GL} from './GL.js';

export class Texture {
    private gl = GL.instance;
    private textrue?: WebGLTexture | null;

    public constructor() {
        this.textrue = this.gl.createTexture();
        this.create();
    }

    private create(): void {
        if (this.textrue) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textrue);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            return;
        }
        throw new Error("Fail to create texture.");
    }

    public getWebGLTexture(): WebGLTexture {
        if (this.textrue) {
            return this.textrue;
        }
        throw new Error("Fail to get texture.");
    }

    public bind(): void {
        if (this.textrue) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textrue);
        }
    }

    public unbind(): void {
        if (this.textrue) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
    }

    public texImage2D(x: number, y: number, pixel: ArrayBufferView | null) {
        this.bind();
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, x, y, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixel);
    }
}
