import {GL} from './GL';

export class Texture {
    private gl = GL.instance;
    private textrue?: WebGLTexture | null;
    private image?: HTMLImageElement;
    private imageSource: string;

    public constructor(imgSource: string) {
        this.imageSource = imgSource;
    }

    private init(): void {
        if (this.imageSource) {
            this.textrue = this.gl.createTexture();
            this.image = new Image();
            this.image.src = this.imageSource;
            return;
        }
        throw new Error("Fail to initialize texture.");
    }

    public create(): void {
        this.init();
        if (this.textrue && this.image) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textrue);
            this.gl.texImage2D(this.gl.TEXTURE_2D, this.gl.RGBA, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            return;
        }
        throw new Error("Fail to create texture.");
    }
}
