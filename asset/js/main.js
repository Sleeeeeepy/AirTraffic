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
    let radius = 100;
    let zoom = 2.0;
    let cam = new Camera(Math.PI / 3, 1, 0.1, 2000);
    let cameraMat = new mat4([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
    cameraMat.rotate(cam.pov, new vec3([1, 0, 0]));
    cameraMat.translate(new vec3([0, 0, radius * zoom]));
    let uInverseCameraTransform = cameraMat.copy().inverse();
    let uModelTransform = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
    let uCameraProjection = cam.proMatrix;
    let uict = prog.getUniformLocation("uInverseCameraTransform");
    let ucp = prog.getUniformLocation("uCameraProjection");
    gl.uniformMatrix4fv(uict, false, uInverseCameraTransform.all());
    gl.uniformMatrix4fv(ucp, false, uCameraProjection.all());
    vertexBuffer.bind();
    let vertexPositionAttribute = gl.getAttribLocation(cprog, "vPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    vertexBuffer.unbind();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.LINE_STRIP, Earth.index.length, gl.UNSIGNED_SHORT, 0);
    gl.flush();
    vertexBuffer.unbind();
}
function initGL(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
function initCamera(radius, gl) {
}
//# sourceMappingURL=main.js.map