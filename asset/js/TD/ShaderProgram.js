import { GL } from './GL.js';
export class ShaderProgram {
    constructor(name, vertexShader, fragmentShader) {
        this.gl = GL.instance;
        this.name = name;
        this.create(vertexShader, fragmentShader);
    }
    create(...shaders) {
        this.init();
        this.shaders = shaders;
        for (let i = 0; i < shaders.length; i++) {
            let shader = shaders[i];
            let gl_shader = shader.create();
            if (shader.isCreated) {
                this.attach(gl_shader);
            }
        }
        this.link();
        if (this.program) {
            return this.program;
        }
        throw new Error(`Fail to get ShaderProgam ${this.name}.`);
    }
    attach(shader) {
        if (this.program) {
            this.gl.attachShader(this.program, shader);
            return;
        }
        throw new Error("Fail to attach shader.");
    }
    link() {
        if (this.program) {
            this.gl.linkProgram(this.program);
            return;
        }
        throw new Error("Fail to link program.");
    }
    init() {
        let _prog = this.gl.createProgram();
        if (_prog) {
            this.program = _prog;
            return;
        }
        throw new Error("Fail to initialize shader program.");
    }
    get WebGLProgram() {
        if (this.program) {
            return this.program;
        }
        throw new Error(`Fail to get shader program ${this.name}.`);
    }
    use() {
        if (this.program) {
            this.gl.useProgram(this.program);
            return;
        }
        throw new Error(`Fail to use ShaderProgam ${this.name}.`);
    }
    getAttributeLocation(attributeName) {
        if (this.program) {
            this.gl.useProgram(this.program);
            let location = this.gl.getAttribLocation(this.program, attributeName);
            return location;
        }
        throw new Error(`Fail to get location of ${attributeName}.`);
    }
    getUniformLocation(uniformName) {
        if (this.program) {
            this.gl.useProgram(this.program);
            let location = this.gl.getUniformLocation(this.program, uniformName);
            if (location) {
                return location;
            }
        }
        throw new Error(`Fail to get location of ${uniformName}`);
    }
    setVertexArrayObject(attributeName, buffer, size, type, normalized, stride, offset) {
        if (this.program) {
            let location = this.getAttributeLocation(attributeName);
            this.gl.enableVertexAttribArray(location);
            buffer.bind();
            this.gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
            buffer.unbind();
            return;
        }
        throw new Error("Fail to set VAO");
    }
    cleanUp() {
        if (this.shaders && this.shaders.length != 0 && this.program) {
            for (let i = 0; i < this.shaders.length; i++) {
                this.gl.detachShader(this.program, this.shaders[i]);
                this.gl.deleteShader(this.shaders[i]);
            }
            this.shaders = null;
            return;
        }
        console.log(`It looks like the ShaderProgram ${this.name} has already been cleaned up.`);
    }
    delete() {
        if (this.program) {
            this.cleanUp();
            this.gl.deleteProgram(this.program);
            this.gl.useProgram(null);
        }
        console.log(`ShaderProgram ${this.name} is deleted.`);
        return;
    }
}
//# sourceMappingURL=ShaderProgram.js.map