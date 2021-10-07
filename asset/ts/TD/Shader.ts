import {GL} from './GL.js';

export class Shader {
    private id: string;
    private type: number;
    private gl: WebGL2RenderingContext = GL.instance;
    private _isCreated: boolean = false;

    public constructor(id: string, type: number) {
        this.id = id;
        this.type = type;
    }

    public get isCreated(): boolean {
        return this._isCreated;
    }

    //완료: 셰이더 파일 로딩하여 전달
    public create(): WebGLShader {
        let source = this.loadFromHTML(this.id);
        let shader = this.loadShader(source, this.type);
        return shader;
    }

    //완료: 셰이더가 잘 컴파일되었는지 확인 
    private loadShader(source: string, type: number): WebGLShader {
        let shader: WebGLShader | null = this.gl.createShader(type);
        if (shader) {
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            //check shader
            if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                this._isCreated = true;
                return shader;
            }
        }
        console.error(source);
        throw new Error(this.gl.getShaderInfoLog(shader!)!);
    }

    private loadFromHTML(id: string): string {
        let doc = document.getElementById(id);
        if (doc) {
            return doc.innerHTML;
        }
        throw new Error("Fail to load shader from HTML file. " + id + " does not exist.");
    }
}
