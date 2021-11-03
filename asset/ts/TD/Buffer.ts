import {GL} from './GL.js';

export class Buffer {
    private gl: WebGL2RenderingContext = GL.instance;
    private buffer?: WebGLBuffer;
    private bufferType: number;
    private drawHint: number;
    private lastLength: number = 0;

    public constructor(bufferType: number, drawHint: number = GL.instance.DYNAMIC_DRAW) {
        this.bufferType = bufferType;
        this.drawHint = drawHint;
        this.create();
    }

    private create(): void {
        let _buf = this.gl.createBuffer();
        if (_buf) {
            this.buffer = _buf;
            return;
        }
        throw new Error("Fail to create the GLBuffer.");
    }

    public release(): void {
        if (this.buffer) {
            this.gl.deleteBuffer(this.buffer);
            return;
        }
        console.log("Fail to release the buffer. the buffer is null.");
    }

    public upload(data: Float32Array): void {
        if (this.buffer && data) {
            this.gl.bindBuffer(this.bufferType, this.buffer);
            this.gl.bufferData(this.bufferType, data, this.drawHint);
            this.lastLength = data.length;
            return;
        }
        throw new Error("Fail to upload data to GPU.");
    }

    public uploadUShort(data: Uint16Array): void {
        if (this.buffer && data) {
            this.gl.bindBuffer(this.bufferType, this.buffer);
            this.gl.bufferData(this.bufferType, data, this.drawHint);
            this.lastLength = data.length;
            return;
        }
        throw new Error("Fail to upload data to GPU.");
    }

    public bind(): void {
        if (this.buffer) {
            this.gl.bindBuffer(this.bufferType, this.buffer);
            return;
        }
        throw new Error("Fail to bind buffer.");
    }

    public unbind(): void {
        this.gl.bindBuffer(this.bufferType, null);
        return;
    }

    public get length() {
        return this.lastLength;
    }
    /*
    public bindBaseWithName(program: WebGLProgram, name: string): void {
        if (this.buffer) {
            this.gl.bindBufferBase(this.bufferType, this.getIndex(program, name), this.buffer);
            return;
        }
        throw new Error("Fail to bind buffer base.");
    }

    public bindBase(program: WebGLProgram, index: number): void {
        if (this.buffer) {
            this.gl.bindBufferBase(this.bufferType, index, this.buffer);
            return;
        }
        throw new Error("Fail to bind buffer base.");
    }

    private getIndex(program: WebGLProgram, name: string): number {
        return this.gl.getUniformBlockIndex(program, name);
    }
    */
}
