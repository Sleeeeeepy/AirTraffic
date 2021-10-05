/// <reference path="GL.ts" />
namespace TD {
    export class Buffer {
        private gl: WebGL2RenderingContext = GL.instance;
        private buffer?: WebGLBuffer;
        private bufferType: number;
        private drawHint: number;

        public constructor(bufferType: number, drawHint: number = GL.instance.DYNAMIC_DRAW) {
            this.bufferType = bufferType;
            this.drawHint = drawHint;
            this.create();
        }

        public create(): void {
            let _buf = this.gl.createBuffer();
            if (_buf) {
                this.buffer = _buf;
                return;
            }
            throw new Error("Fail to create the GLBuffer.");
        }

        public release(): void {
            if (this.buffer) {
                this.gl.deleteBuffer(this.buffer);
                return;
            }
            console.log("Fail to release the buffer. the buffer is null.");
        }

        public upload(data: Float32Array): void {
            if (this.buffer && data) {
                this.gl.bindBuffer(this.bufferType, this.buffer);
                this.gl.bufferData(this.bufferType, data, this.drawHint);
                return;
            }
            throw new Error("Fail to upload data to GPU.");
        }
        
        public unbind(): void {
            this.gl.bindBuffer(this.bufferType, null);
            return;
        }

        public bindBaseWithName(program: WebGLProgram, name: string): void {
            if (this.buffer) {
                this.gl.bindBufferBase(this.bufferType, this.getIndex(program, name), this.buffer);
                return;
            }
            throw new Error("Fail to bind buffer base.");
        }

        public bindBase(program: WebGLProgram, index: number): void {
            if (this.buffer) {
                this.gl.bindBufferBase(this.bufferType, index, this.buffer);
                return;
            }
            throw new Error("Fail to bind buffer base.");
        }

        private getIndex(program: WebGLProgram, name: string): number {
            return this.gl.getUniformBlockIndex(program, name);
        }
    }
}