import { GL } from "./GL.js";
export class ArrayRenderer {
    constructor(buffer, stride, program, drawMode, callback, aftercallback) {
        this.gl = GL.instance;
        this.stride = 3;
        this.buffer = buffer;
        this.stride = stride;
        this.program = program;
        this.drawMode = drawMode;
        this.callback = callback;
        this.aftercallback = aftercallback;
        callback.bind(this);
        aftercallback.bind(this);
    }
    draw() {
        this.callback();
        this.buffer.bind();
        this.program.use();
        this.gl.drawArrays(this.drawMode, 0, this.buffer.length / this.stride);
        this.aftercallback();
    }
}
//# sourceMappingURL=ArrayRenderer.js.map