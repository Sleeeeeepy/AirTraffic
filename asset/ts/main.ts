import {Buffer} from './TD/Buffer.js';
import { Camera } from './TD/Camera.js';
import {Earth} from './TD/Earth.js';
import {GL} from './TD/GL.js';
import {Shader} from './TD/Shader.js';
import {ShaderProgram} from './TD/ShaderProgram.js'; 
import mat4 from './tsm/mat4.js';
import vec3 from './tsm/vec3.js';
import vec4 from './tsm/vec4.js';

// entry point
main();

function main() {
    //초기 설정을 합니다.
    const gl = GL.instance;
    initGL(gl);

    // 다음 코드부터는 임시 코드입니다.
    // 버퍼에 정점 정보를 입력합니다.
    let vertexBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    Earth.create(1.0, 18, 18);
    vertexBuffer.upload(new Float32Array(Earth.vertice));
    vertexBuffer.unbind();

    // 버퍼에 인덱스 정보를 입력합니다.
    let indexBuffer = new Buffer(gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
    indexBuffer.uploadUShort(new Uint16Array(Earth.index));

    /*
    let texbuff = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    texbuff.upload(new Float32Array(Earth.texcoord));
    texbuff.unbind();
    */

    // 셰이더 객체 생성
    let vshader = new Shader("earth.vert", gl.VERTEX_SHADER);
    let fshader = new Shader("earth.frag", gl.FRAGMENT_SHADER);

    // 셰이더 프로그램 생성
    let prog = new ShaderProgram("shader");
    let cprog = prog.getShaderProgram(vshader, fshader);
    prog.use();

    // 카메라 설정
    
    let radius = 100;
    let zoom = 1.0;
    let cam = new Camera(Math.PI/3, 1, 0.1, 2000);
    let cameraMat = new mat4([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1]);
    cameraMat.rotate(cam.pov, new vec3([1, -1, 1]));
    cameraMat.translate(new vec3([0, 0, radius * zoom]));
    let uInverseCameraTransform = cameraMat.copy().inverse();
    let uModelTransform = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];
    let uCameraProjection = cam.proMatrix;

    let uict = prog.getUniformLocation("uInverseCameraTransform");
    //let umt = prog.getUniformLocation("uModelTransform");
    let ucp = prog.getUniformLocation("uCameraProjection");
    gl.uniformMatrix4fv(uict, false, uInverseCameraTransform.all());
    //gl.uniformMatrix4fv(umt, false, uModelTransform);
    gl.uniformMatrix4fv(ucp, false, uCameraProjection.all());
    
    // Vertex 설정
    vertexBuffer.bind();
    let vertexPositionAttribute = gl.getAttribLocation(cprog, "vPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    vertexBuffer.unbind();

    // draw
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.LINE_STRIP, Earth.index.length, gl.UNSIGNED_SHORT, 0);
    gl.flush();
    vertexBuffer.unbind();
/*
    let points = Earth.pointAt(1.0, 23.3, 22.8);
    let buffer2 = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    buffer2.upload(new Float32Array(points));

    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, 1);
    gl.flush();
*/
}

function initGL(gl: WebGLRenderingContext) {
    //gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function initCamera(radius: number, gl: WebGLRenderingContext) {

}