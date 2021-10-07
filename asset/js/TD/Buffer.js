import { GL } from './GL.js';
export class Buffer {
    constructor(bufferType, drawHint = GL.instance.DYNAMIC_DRAW) {
        this.gl = GL.instance;
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
            return;
        }
        throw new Error("Fail to upload data to GPU.");
    }
    unbind() {
        this.gl.bindBuffer(this.bufferType, null);
        return;
    }
    bindBaseWithName(program, name) {
        if (this.buffer) {
            this.gl.bindBufferBase(this.bufferType, this.getIndex(program, name), this.buffer);
            return;
        }
        throw new Error("Fail to bind buffer base.");
    }
    bindBase(program, index) {
        if (this.buffer) {
            this.gl.bindBufferBase(this.bufferType, index, this.buffer);
            return;
        }
        throw new Error("Fail to bind buffer base.");
    }
    getIndex(program, name) {
        return this.gl.getUniformBlockIndex(program, name);
    }
}
//# sourceMappingURL=Buffer.js.map