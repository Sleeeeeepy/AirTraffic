import { GL } from "./GL.js";
export class ElementRenderer {
    constructor(buffer, program, drawMode, dataType, callback) {
        this.gl = GL.instance;
        this.buffer = buffer;
        this.program = program;
        this.drawMode = drawMode;
        this.dataType = dataType;
        this.callback = callback;
        callback.bind(this);
    }
    draw() {
        this.callback();
        this.buffer.bind();
        this.program.use();
        this.gl.drawElements(this.drawMode, this.buffer.length, this.dataType, 0);
    }
}
//# sourceMappingURL=ElementRenderer.js.map