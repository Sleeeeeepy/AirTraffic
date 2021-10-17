import { Buffer } from './TD/Buffer.js';
import { Camera } from './TD/Camera.js';
import { Earth } from './TD/Earth.js';
import { GL } from './TD/GL.js';
import { Shader } from './TD/Shader.js';
import { ShaderProgram } from './TD/ShaderProgram.js';
import mat4 from './tsm/mat4.js';
import vec3 from './tsm/vec3.js';
main();
function main() {
    const gl = GL.instance;
    initGL(gl);
    let vertexBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    Earth.create(1.0, 18, 18);
    vertexBuffer.upload(new Float32Array(Earth.vertice));
    vertexBuffer.unbind();
    let indexBuffer = new Buffer(gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
    indexBuffer.uploadUShort(new Uint16Array(Earth.index));
    let vshader = new Shader("earth.vert", gl.VERTEX_SHADER);
    let fshader = new Shader("earth.frag", gl.FRAGMENT_SHADER);
    let prog = new ShaderProgram("shader");
    let cprog = prog.getShaderProgram(vshader, fshader);
    prog.use();
    vertexBuffer.bind();
    let vertexPositionAttribute = gl.getAttribLocation(cprog, "vPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    vertexBuffer.unbind();
    let orbitRadius = 100;
    let zoom = 0.5;
    let pov = Math.PI / 3;
    let aspect = 1.0;
    let camera = new Camera(pov, aspect, 0.1, 2000);
    function initCamera(radian, axis) {
        let identity = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        let cameraMatrix = new mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        cameraMatrix.rotate(radian, axis);
        cameraMatrix.translate(new vec3([0, 0, orbitRadius / zoom]));
        let InverseCameraTransform = cameraMatrix.copy().inverse();
        let CameraProjection = camera.proMatrix;
        let uCameraMatrix = CameraProjection.multiply(InverseCameraTransform);
        let uict = prog.getUniformLocation("uCameraMatrix");
        gl.uniformMatrix4fv(uict, false, uCameraMatrix.all());
        return uCameraMatrix;
    }
    function camRotateZ(cameraMatrix, radian) {
        cameraMatrix.rotate(radian, new vec3([0, 0, 1]));
        let uict = prog.getUniformLocation("uCameraMatrix");
        gl.uniformMatrix4fv(uict, false, cameraMatrix.all());
    }
    function camRotateX(cameraMatrix, radian) {
        cameraMatrix.rotate(radian, new vec3([1, 0, 0]));
        let uict = prog.getUniformLocation("uCameraMatrix");
        gl.uniformMatrix4fv(uict, false, cameraMatrix.all());
    }
    let cam = initCamera(Math.PI / 2, new vec3([1, 0, 0]));
    draw();
    var tick = setInterval(function () {
        camRotateZ(cam, Math.PI / 600);
        camRotateX(cam, -Math.PI / 300);
        draw();
    }, 10);
}
function initGL(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
function draw() {
    const gl = GL.instance;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.LINE_STRIP, Earth.index.length, gl.UNSIGNED_SHORT, 0);
    gl.flush();
}
//# sourceMappingURL=main.js.map