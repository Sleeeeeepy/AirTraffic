import {GL} from './GL.js';
import {Shader} from './Shader.js';
import {Buffer} from './Buffer.js';

export class ShaderProgram {
    private gl: WebGLRenderingContext = GL.instance;
    private name: string;
    private program?: WebGLProgram;
    private shaders?: Shader[] | null;

    public constructor(name: string, vertexShader: Shader, fragmentShader: Shader) {
        this.name = name;
        this.create(vertexShader, fragmentShader);
    }

    private create(...shaders: Shader[]) {
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
    private attach(shader: WebGLShader): void {
        if (this.program) {
            this.gl.attachShader(this.program, shader);
            return;
        }
        throw new Error("Fail to attach shader.");
    }

    private link(): void {
        if (this.program) {
            this.gl.linkProgram(this.program);
            return;
        }
        throw new Error("Fail to link program.");
    }

    private init(): void {
        let _prog = this.gl.createProgram();
        if (_prog) {
            this.program = _prog;
            return;
        }
        throw new Error("Fail to initialize shader program.");
    }

    public get WebGLProgram(): WebGLProgram {
        if (this.program) {
            return this.program;
        }
        throw new Error(`Fail to get shader program ${this.name}.`);
    }

    public use() {
        if (this.program) {
            this.gl.useProgram(this.program);
            return
        }
        throw new Error(`Fail to use ShaderProgam ${this.name}.`);
    }

    public getAttributeLocation(attributeName: string): number {
        if (this.program) {
            this.gl.useProgram(this.program);
            let location = this.gl.getAttribLocation(this.program, attributeName);
            return location;
        }
        throw new Error(`Fail to get location of ${attributeName}.`);
    }

    public getUniformLocation(uniformName: string): WebGLUniformLocation {
        if (this.program) {
            this.gl.useProgram(this.program);
            let location = this.gl.getUniformLocation(this.program, uniformName);
            if (location) {
                return location;
            }
        }
        throw new Error(`Fail to get location of ${uniformName}`);
    }

    public setVertexArrayObject(attributeName: string, buffer: Buffer, size: number, type: number, normalized: boolean, stride: number, offset: number): void {
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

    public cleanUp(): void {
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

    public delete(): void {
        if (this.program) {
            this.cleanUp();
            this.gl.deleteProgram(this.program);
            this.gl.useProgram(null);
        }
        console.log(`ShaderProgram ${this.name} is deleted.`);
        return;
    }
}
