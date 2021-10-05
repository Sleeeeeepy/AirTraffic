/// <reference path="./TD/Shader.ts" />
/// <reference path="./TD/ShaderProgram.ts" />
/// <reference path="./TD/GL.ts" />
/// <reference path="./TD/Buffer.ts" />
// entry point
main();

function main() {
    //초기 설정을 합니다.
    const canvas = <HTMLCanvasElement>document.getElementById("gl_canvas");
    const gl = TD.GL.instance;
    initGL(gl, canvas);

    window.onresize = function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height); 
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 4);   
    };

    // 다음 코드부터는 임시 코드입니다.
    // 버퍼에 정점 정보를 입력합니다.
    let buffer = new TD.Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    let vertices = new Float32Array([
                                    0.0,  0.25,  1.0, 1.0,
                                    -0.25, 0.25,  1.0, 1.0,
                                    0.25,  -0.25, 1.0, 1.0
                                ]);
    buffer.upload(vertices);
    
    // 셰이더 객체 생성
    let vshader = new TD.Shader("simple1.vert", gl.VERTEX_SHADER);
    let fshader = new TD.Shader("simple1.frag", gl.FRAGMENT_SHADER);

    // 셰이더 프로그램 생성
    let prog = new TD.ShaderProgram("shader");
    let cprog = prog.getShaderProgram(vshader, fshader);
    prog.use();

    // 어트리뷰트 설정
    let vertexPositionAttribute = gl.getAttribLocation(cprog, "vPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    // draw
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 4);
  
}

function initGL(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
    //gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}