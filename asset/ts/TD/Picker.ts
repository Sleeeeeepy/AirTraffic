import { FrameBuffer } from "./FrameBuffer.js";
import { GL } from "./GL.js";
import { IRenderer } from "./IRenderer.js";
import { ShaderProgram } from "./ShaderProgram.js";

export class Picker {
    private gl: WebGLRenderingContext = GL.instance;
    private _frameBuffer: FrameBuffer | null;

    public constructor(frameBuffer: FrameBuffer | null) {
        this._frameBuffer = frameBuffer;
    }

    private readSinglePixel(x: number, y: number): Uint8Array {
        let data = new Uint8Array(4);
        this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
        return data;
    }

    //////////////////////////////////////////////////////////////////////////////////
    // id는 어떻게 생성하던간에 프레임 버퍼로 부터 픽셀 RGBA값을 읽어,                  //
    // 계산을 통해 하나의 id로 결정할 수 있으면 모두 가능합니다.                        //
    // 예를들어 아래와 같은 방식은 비트 시프트를 이용하며 아래 함수는                    //
    // 아래 링크를 참조했습니다.                                                      //
    // @https://webglfundamentals.org/webgl/lessons/webgl-picking.html              //
    // 하지만 다음 링크는 r, g, b, a의 지수연산을 이용하여 계산합니다.                  //
    // 어느 쪽을 이용하든 계산 결과는 하나의 id를 매핑합니다.                           //
    // @http://learnwebgl.brown37.net/11_advanced_rendering/selecting_objects.html  //
    // 위 두 예제 중 가장 직관적이고 친숙한 것은 첫번째이므로 첫번째를 택했습니다.        //
    private getIdentifier(readFromPixel: Uint8Array): number {
        return readFromPixel[0] +
            (readFromPixel[1] << 8) +
            (readFromPixel[2] << 16) +
            (readFromPixel[3] << 24);
    }

    public static makeIdentifier(id: number): Array<number> {
        return new Array<number>(
            ((id >> 0) & 0xFF) / 0xFF,
            ((id >> 8) & 0xFF) / 0xFF,
            ((id >> 16) & 0xFF) / 0xFF,
            ((id >> 24) & 0xFF) / 0xFF
        );
    }


    /*
    원리: 클릭하는 순간 다른 프레임 버퍼 오브젝트에 그림을 그립니다.
    프레임 버퍼 오프젝트로부터 픽셀을 읽어서 값을 뽑아옵니다.
    @https://diehard98.tistory.com/entry/FBO-FrameBuffer-Object-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0
    */
    public select(x: number, y: number): number {
        if (this._frameBuffer) {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._frameBuffer.getWebGLFrameBuffer());
        } else {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        }
        let data = this.readSinglePixel(x, y);
        //this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        return this.getIdentifier(data);
    }
}