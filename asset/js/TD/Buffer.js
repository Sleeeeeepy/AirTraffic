import { GL } from './GL.js';
export class Buffer {
    constructor(bufferType, drawHint = GL.instance.DYNAMIC_DRAW) {
        this.gl = GL.instance;
        this.lastLength = 0;
        this.bufferType = bufferType;
        this.drawHint = drawHint;
        this.create();
    }
    create() {
        let _buf = this.gl.createBuffer();
        if (_buf) {
            this.buffer = _buf;
            return;
        }
        throw new Error("Fail to create the GLBuffer.");
    }
    release() {
        if (this.buffer) {
            this.gl.deleteBuffer(this.buffer);
            return;
        }
        console.log("Fail to release the buffer. the buffer is null.");
    }
    upload(data) {
        if (this.buffer && data) {
            this.gl.bindBuffer(this.bufferType, this.buffer);
            this.gl.bufferData(this.bufferType, data, this.drawHint);
            this.lastLength = data.length;
            return;
        }
        throw new Error("Fail to upload data to GPU.");
    }
    uploadUShort(data) {
        if (this.buffer && data) {
            this.gl.bindBuffer(this.bufferType, this.buffer);
            this.gl.bufferData(this.bufferType, data, this.drawHint);
            this.lastLength = data.length;
            return;
        }
        throw new Error("Fail to upload data to GPU.");
    }
    bind() {
        if (this.buffer) {
            this.gl.bindBuffer(this.bufferType, this.buffer);
            return;
        }
        throw new Error("Fail to bind buffer.");
    }
    unbind() {
        this.gl.bindBuffer(this.bufferType, null);
        return;
    }
    get length() {
        return this.lastLength;
    }
}
//# sourceMappingURL=Buffer.js.map