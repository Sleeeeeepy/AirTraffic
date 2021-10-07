import { GL } from './GL.js';
export class Shader {
    constructor(id, type) {
        this.gl = GL.instance;
        this._isCreated = false;
        this.id = id;
        this.type = type;
    }
    get isCreated() {
        return this._isCreated;
    }
    create() {
        let source = this.loadFromHTML(this.id);
        let shader = this.loadShader(source, this.type);
        return shader;
    }
    loadShader(source, type) {
        let shader = this.gl.createShader(type);
        if (shader) {
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                this._isCreated = true;
                return shader;
            }
        }
        console.error(source);
        throw new Error(this.gl.getShaderInfoLog(shader));
    }
    loadFromHTML(id) {
        let doc = document.getElementById(id);
        if (doc) {
            return doc.innerHTML;
        }
        throw new Error("Fail to load shader from HTML file. " + id + " does not exist.");
    }
}
//# sourceMappingURL=Shader.js.map