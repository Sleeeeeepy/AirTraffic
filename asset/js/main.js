import { Buffer } from './TD/Buffer.js';
import { Camera } from './TD/Camera.js';
import { Earth } from './TD/Earth.js';
import { GL } from './TD/GL.js';
import { Shader } from './TD/Shader.js';
import { ShaderProgram } from './TD/ShaderProgram.js';
import { Texture } from './TD/Texture.js';
main();
function main() {
    const gl = GL.instance;
    initGL(gl);
    Earth.create(1.0, 36, 36);
    let vshader = new Shader("earth.vert", gl.VERTEX_SHADER);
    let fshader = new Shader("earth.frag", gl.FRAGMENT_SHADER);
    let prog = new ShaderProgram("earth", vshader, fshader);
    prog.use();
    let vertexBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    vertexBuffer.upload(new Float32Array(Earth.vertex));
    vertexBuffer.unbind();
    let indexBuffer = new Buffer(gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
    indexBuffer.uploadUShort(new Uint16Array(Earth.index));
    indexBuffer.unbind();
    let uvBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    uvBuffer.upload(new Float32Array(Earth.texcoord));
    uvBuffer.unbind();
    vertexBuffer.bind();
    prog.setVertexArrayObject("vPosition", vertexBuffer, 3, gl.FLOAT, false, 0, 0);
    vertexBuffer.unbind();
    uvBuffer.bind();
    prog.setVertexArrayObject("vinTexturecoord", uvBuffer, 2, gl.FLOAT, false, 0, 0);
    uvBuffer.unbind();
    let dayTexture = new Texture("/asset/textures/earth_day.jpg", gl.TEXTURE0);
    gl.uniform1i(prog.getUniformLocation("uDayTexture"), 0);
    indexBuffer.bind();
    let orbitRadius = 100;
    let zoom = 0.5;
    let fov = Math.PI / 3;
    let aspect = 1.0;
    let camera = new Camera(fov, aspect, 0.1, 2000, orbitRadius, zoom);
    let cam = camera.cameraMatrix;
    gl.uniformMatrix4fv(prog.getUniformLocation("uCameraMatrix"), false, cam.all());
    let fvshader = new Shader("flight.vert", gl.VERTEX_SHADER);
    let ffshader = new Shader("flight.frag", gl.FRAGMENT_SHADER);
    let fprog = new ShaderProgram("flight", fvshader, ffshader);
    fprog.use();
    let fvbo = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    let melbourne = Earth.pointAt(1.01, 144, -37);
    let seoul = Earth.pointAt(1.01, 126, 37);
    let tokyo = Earth.pointAt(1.01, 139, 35);
    let newyork = Earth.pointAt(1.01, -73, 40);
    let losAngeles = Earth.pointAt(1.01, -118, 34);
    let origin = Earth.pointAt(1.01, 0, 0);
    let points = melbourne.concat(seoul, tokyo, newyork, origin, losAngeles);
    fvbo.upload(new Float32Array(points));
    fvbo.bind();
    gl.uniformMatrix4fv(fprog.getUniformLocation("uCameraMatrix"), false, cam.all());
    let ptr = fprog.getAttributeLocation("vPosition");
    gl.enableVertexAttribArray(ptr);
    gl.vertexAttribPointer(ptr, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, 6);
    var tick = setInterval(function () {
        camera.RotateZ(Math.PI / 100);
        let uict = fprog.getUniformLocation("uCameraRotateMatrix");
        gl.uniformMatrix4fv(uict, false, camera.rotateMatrix.all());
        uict = prog.getUniformLocation("uCameraRotateMatrix");
        gl.uniformMatrix4fv(uict, false, camera.rotateMatrix.all());
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        drawEarth(indexBuffer, prog);
        drawPoint(fvbo, fprog);
    }, 10);
}
function initGL(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
function drawEarth(buffer, program) {
    const gl = GL.instance;
    program.use();
    buffer.bind();
    gl.drawElements(gl.TRIANGLE_STRIP, Earth.index.length, gl.UNSIGNED_SHORT, 0);
}
function drawPoint(buffer, program) {
    const gl = GL.instance;
    program.use();
    buffer.bind();
    gl.drawArrays(gl.POINTS, 0, 6);
}
//# sourceMappingURL=main.js.map