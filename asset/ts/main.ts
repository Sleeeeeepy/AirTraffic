import { Buffer } from './TD/Buffer.js';
import { Camera } from './TD/Camera.js';
import { DataProvider } from './TD/DataProvider.js';
import { Earth } from './TD/Earth.js';
import { GL } from './TD/GL.js';
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
    initGL(gl);
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

    //텍스쳐 설정
    let texture = new Texture("/asset/textures/earth_day.jpg", gl.TEXTURE0);
    gl.uniform1i(prog.getUniformLocation("uTexture"), 0);
    gl.bindTexture(gl.TEXTURE_2D, texture.getWebGLTexture());

    //인덱스 버퍼 바인드
    indexBuffer.bind();

    // 카메라 설정
    let orbitRadius = 100;
    let zoom = 0.7;
    let fov = Math.PI / 3
    let aspect = 1.0;
    let camera = new Camera(fov, aspect, 0.1, 2000);
    function initCamera(radian: number, axis: vec3, prog: ShaderProgram): mat4 {
        let cameraMatrix = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1]);
        cameraMatrix.rotate(radian, axis);
        cameraMatrix.translate(new vec3([0, 0, orbitRadius / zoom]));
        let InverseCameraTransform = cameraMatrix.copy().inverse();
        let CameraProjection = camera.proMatrix;
        let uCameraMatrix = CameraProjection.multiply(InverseCameraTransform);
        let uict = prog.getUniformLocation("uCameraMatrix");
        gl.uniformMatrix4fv(uict, false, uCameraMatrix.all());
        return uCameraMatrix;
    }

    function camRotateZ(cameraMatrix: mat4, radian: number) {
        cameraMatrix.rotate(radian, new vec3([0, 0, 1]));
    }

    function camRotateX(cameraMatrix: mat4, radian: number) {
        cameraMatrix.rotate(radian, new vec3([0, 1, 0]));
    }

    let cam = initCamera(Math.PI / 2, new vec3([1, 0, 0]), prog);
    drawEarth(indexBuffer, prog);

    let fvshader = new Shader("flight.vert", gl.VERTEX_SHADER);
    let ffshader = new Shader("flight.frag", gl.FRAGMENT_SHADER);
    let fprog = new ShaderProgram("flight", fvshader, ffshader);
    fprog.use();
    
    let fvbo = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    let melbourne = Earth.pointAt(1.01, 144, -37);
    let seoul = Earth.pointAt(1.01, 126, 37);
    let tokyo = Earth.pointAt(1.01, 139, 35);
    let newyork = Earth.pointAt(1.01, -73, 40);
    let origin = Earth.pointAt(1.01, 0, 0);
    let points = melbourne.concat(seoul, tokyo, newyork, origin);
    console.log(points);
    fvbo.upload(new Float32Array(points));
    fvbo.bind();
    
    let uict = fprog.getUniformLocation("uCameraMatrix");
    gl.uniformMatrix4fv(uict, false, cam.all());
    
    let ptr = fprog.getAttributeLocation("vPosition");
    gl.enableVertexAttribArray(ptr);
    gl.vertexAttribPointer(ptr, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, 5);
    
    //카메라를 회전시키는 임시 코드
    var tick = setInterval(function () {
        camRotateZ(cam, Math.PI / 100);
        //camRotateX(cam, -Math.PI / 360);
        let uict = fprog.getUniformLocation("uCameraMatrix");
        gl.uniformMatrix4fv(uict, false, cam.all());
        uict = prog.getUniformLocation("uCameraMatrix");
        gl.uniformMatrix4fv(uict, false, cam.all());
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        drawEarth(indexBuffer, prog);
        drawPoint(fvbo, fprog);
    }, 100);
    
}

function initGL(gl: WebGLRenderingContext) {
    //gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function drawEarth(buffer: Buffer, program: ShaderProgram) {
    const gl = GL.instance;
    program.use();
    buffer.bind();
    gl.drawElements(gl.TRIANGLE_STRIP, Earth.index.length, gl.UNSIGNED_SHORT, 0);
}

function drawPoint(buffer: Buffer, program: ShaderProgram) {
    const gl = GL.instance;
    program.use();
    buffer.bind();
    gl.drawArrays(gl.POINTS, 0, 5);
}