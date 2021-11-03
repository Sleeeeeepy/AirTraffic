import { ArrayRenderer } from './TD/ArrayRenderer.js';
import { Buffer } from './TD/Buffer.js';
import { Camera } from './TD/Camera.js';
import { DataProvider } from './TD/DataProvider.js';
import { Earth } from './TD/Earth.js';
import { ElementRenderer } from './TD/ElementRenderer.js';
import { GL } from './TD/GL.js';
import { Renderer } from './TD/Renderer.js';
import { Shader } from './TD/Shader.js';
import { ShaderProgram } from './TD/ShaderProgram.js';
import { Texture } from './TD/Texture.js';
import mat4 from './tsm/mat4.js';
import vec3 from './tsm/vec3.js';

// entry point
main();

function main() {
    //초기 설정을 합니다.
    const gl = GL.instance;
    initGL();
    Earth.create(1.0, 36, 36);

    // 셰이더 객체 생성
    let vshader = new Shader("earth.vert", gl.VERTEX_SHADER);
    let fshader = new Shader("earth.frag", gl.FRAGMENT_SHADER);

    // 셰이더 프로그램 생성
    let prog = new ShaderProgram("earth", vshader, fshader);
    prog.use();

    // 버퍼에 정점 정보를 입력합니다.
    let vertexBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    vertexBuffer.upload(new Float32Array(Earth.vertex));
    vertexBuffer.unbind();

    // 버퍼에 인덱스 정보를 입력합니다.
    let indexBuffer = new Buffer(gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
    indexBuffer.uploadUShort(new Uint16Array(Earth.index));
    indexBuffer.unbind();

    // 버퍼에 텍스처 좌표 정보를 입력합니다.
    let uvBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    uvBuffer.upload(new Float32Array(Earth.texcoord));
    uvBuffer.unbind();

    // 정점 설정
    vertexBuffer.bind();
    prog.setVertexArrayObject("vPosition", vertexBuffer, 3, gl.FLOAT, false, 0, 0);
    vertexBuffer.unbind();

    // 텍스처 좌표 설정
    uvBuffer.bind();
    prog.setVertexArrayObject("vinTexturecoord", uvBuffer, 2, gl.FLOAT, false, 0, 0);
    uvBuffer.unbind();

    //낮 텍스처 설정
    let dayTexture = new Texture("/asset/textures/earth_day.jpg", gl.TEXTURE0);
    gl.uniform1i(prog.getUniformLocation("uDayTexture"), 0);

    //밤 텍스처 설정
    /*
    let nightTexture = new Texture("/asset/textures/earth_night.jpg", gl.TEXTURE1);
    gl.uniform1i(prog.getUniformLocation("uNightTexture"), 1);
    */
    //구름 텍스처 설정
    /*
    let cloudTexture = new Texture("", gl.TEXTURE2);
    gl.uniform1i(prog.getUniformLocation("uCloudTexture"), 2);
    */

    //인덱스 버퍼 바인드
    indexBuffer.bind();

    // 카메라 설정
    let orbitRadius = 100;
    let zoom = 0.5;
    let fov = Math.PI / 3
    let aspect = 1.0;
    let camera = new Camera(fov, aspect, 0.1, 200, orbitRadius, zoom);
    let cam = camera.cameraMatrix;
    gl.uniformMatrix4fv(prog.getUniformLocation("uCameraMatrix"), false, cam.all());

    //점 설정
    let fvshader = new Shader("flight.vert", gl.VERTEX_SHADER);
    let ffshader = new Shader("flight.frag", gl.FRAGMENT_SHADER);
    let fprog = new ShaderProgram("flight", fvshader, ffshader);
    fprog.use();
    
    let fvbo = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    let points = exampleCode();
    fvbo.upload(new Float32Array(points));
    fvbo.bind();

    gl.uniformMatrix4fv(fprog.getUniformLocation("uCameraMatrix"), false, cam.all());
    
    let ptr = fprog.getAttributeLocation("vPosition");
    gl.enableVertexAttribArray(ptr);
    gl.vertexAttribPointer(ptr, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, 6);

    function clear() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    function rotate() {
        camera.RotateZ(Math.PI/360);
    }

    function drawEarth() {
        gl.enable(gl.DEPTH_TEST);
        gl.uniformMatrix4fv(prog.getUniformLocation("uCameraRotateMatrix"), false, camera.rotateMatrix.all());
    }

    function drawPoint() {
        gl.disable(gl.DEPTH_TEST);
        gl.uniformMatrix4fv(fprog.getUniformLocation("uCameraRotateMatrix"), false, camera.rotateMatrix.all());
    }

    let scene = new Renderer(clear, rotate);
    scene.addRenderer(new ElementRenderer(indexBuffer, prog, gl.TRIANGLE_STRIP, drawEarth));
    scene.addRenderer(new ArrayRenderer(fvbo, 3, fprog, gl.POINTS, drawPoint));
    scene.requestAnimation();
}

function initGL() {
    const gl = GL.instance;
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function exampleCode() { 
    let melbourne = Earth.pointAt(1.0, 144, -37);
    let seoul = Earth.pointAt(1.0, 126, 37);
    let tokyo = Earth.pointAt(1.0, 139, 35);
    let newyork = Earth.pointAt(1.0, -73, 40); 
    let losAngeles = Earth.pointAt(1.0, -118, 34);
    let origin = Earth.pointAt(1.0, 0, 0);
    let points = melbourne.concat(seoul, tokyo, newyork, origin, losAngeles);
    return points;
}