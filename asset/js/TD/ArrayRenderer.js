import { GL } from "./GL.js";
export class ArrayRenderer {
    constructor(buffer, stride, program, drawMode, callback) {
        this.gl = GL.instance;
        this.stride = 3;
        this.buffer = buffer;
        this.stride = stride;
        this.program = program;
        this.drawMode = drawMode;
        this.callback = callback;
        callback.bind(this);
    }
    draw() {
        this.callback();
        this.buffer.bind();
        this.program.use();
        this.gl.drawArrays(this.drawMode, 0, this.buffer.length / this.stride);
    }
}
//# sourceMappingURL=ArrayRenderer.js.map