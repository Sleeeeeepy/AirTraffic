import {GL} from './GL.js';

export class ImageTexture {
    private gl = GL.instance;
    private textrue?: WebGLTexture | null;
    private image?: HTMLImageElement;
    private imageSource: string;
    private textureUnit: number;
    public constructor(imgSource: string, textureUnit: number) {
        this.imageSource = imgSource;
        this.textureUnit = textureUnit;
        this.init();
    }

    private init(): void {
        if (this.imageSource) {
            this.textrue = this.gl.createTexture();
            this.image = new Image();
            this.image.crossOrigin = "Anonymous";
            this.image.src = this.imageSource;
            this.image.onload = () => {
                this.create();
            }
            return;
        }
        throw new Error("Fail to initialize texture.");
    }

    private create(): void {
        if (this.textrue && this.image) {
            this.gl.activeTexture(this.textureUnit);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textrue);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
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

    public changeImage(imgSource: string) {
        this.imageSource = imgSource;
        this.image = new Image();
        this.image.crossOrigin = "Anonymous";
        this.image.src = this.imageSource;
        this.image.onload = () => {
            this.bind();
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image!);
        }
    }
}
