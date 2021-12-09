import { GL } from "./GL.js";
export class ElementRenderer {
    constructor(buffer, program, drawMode, dataType, callback, aftercallback) {
        this.gl = GL.instance;
        this.buffer = buffer;
        this.program = program;
        this.drawMode = drawMode;
        this.dataType = dataType;
        this.callback = callback;
        this.aftercallback = aftercallback;
        callback.bind(this);
        aftercallback.bind(this);
    }
    draw() {
        this.callback();
        this.buffer.bind();
        this.program.use();
        this.gl.drawElements(this.drawMode, this.buffer.length, this.dataType, 0);
        this.aftercallback();
    }
}
//# sourceMappingURL=ElementRenderer.js.map