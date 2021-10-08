import {Buffer} from './TD/Buffer.js';
import {Earth} from './TD/Earth.js';
import {GL} from './TD/GL.js';
import {Shader} from './TD/Shader.js';
import {ShaderProgram} from './TD/ShaderProgram.js'; 

// entry point
main();

function main() {
    //초기 설정을 합니다.
    const canvas = <HTMLCanvasElement>document.getElementById("gl_canvas");
    const gl = GL.instance;
    initGL(gl, canvas);
    /*
    window.onresize = function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height); 
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 4);   
    };
    */

    // 다음 코드부터는 임시 코드입니다.
    // 버퍼에 정점 정보를 입력합니다.
    let buffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    Earth.create(1.0, 36);
    let verts = new Float32Array(Earth.vertice);
    buffer.upload(verts);
    // 셰이더 객체 생성
    let vshader = new Shader("simple1.vert", gl.VERTEX_SHADER);
    let fshader = new Shader("simple1.frag", gl.FRAGMENT_SHADER);

    // 셰이더 프로그램 생성
    let prog = new ShaderProgram("shader");
    let cprog = prog.getShaderProgram(vshader, fshader);
    prog.use();

    // 어트리뷰트 설정
    let vertexPositionAttribute = gl.getAttribLocation(cprog, "vPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    // draw
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, Math.floor(verts.length / 3));
    gl.flush();
    buffer.unbind();

    let points = Earth.pointAt(1.0, 23.3, 22.8);
    let buffer2 = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    buffer2.upload(new Float32Array(points));

    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, 1);
    gl.flush();
}

function initGL(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
    //gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}