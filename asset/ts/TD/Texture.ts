import {GL} from './GL.js';

export class Texture {
    private gl = GL.instance;
    private textrue?: WebGLTexture | null;
    private data: ArrayBufferView | null;

    public constructor(data: ArrayBufferView | null, x: number, y: number) {
        this.textrue = this.gl.createTexture();
        this.data = data;
        this.create(data, x, y);
    }

    private create(data: ArrayBufferView | null, x: number, y:number): void {
        if (this.textrue) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textrue);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, x, y, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
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

    public refresh(x: number, y: number) {
        this.bind();
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, x, y, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.data);
        this.unbind();
    }
}
