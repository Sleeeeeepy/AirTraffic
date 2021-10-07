import { Buffer } from './TD/Buffer.js';
import { Earth } from './TD/Earth.js';
import { GL } from './TD/GL.js';
import { Shader } from './TD/Shader.js';
import { ShaderProgram } from './TD/ShaderProgram.js';
main();
function main() {
    const canvas = document.getElementById("gl_canvas");
    const gl = GL.instance;
    initGL(gl, canvas);
    let buffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    Earth.create(1.0, 36);
    let verts = new Float32Array(Earth.vertice);
    buffer.upload(verts);
    let vshader = new Shader("simple1.vert", gl.VERTEX_SHADER);
    let fshader = new Shader("simple1.frag", gl.FRAGMENT_SHADER);
    let prog = new ShaderProgram("shader");
    let cprog = prog.getShaderProgram(vshader, fshader);
    prog.use();
    let vertexPositionAttribute = gl.getAttribLocation(cprog, "vPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, Math.floor(verts.length / 3));
    gl.flush();
    buffer.unbind();
    let points = pointOnSphere(1.0, 23.3, 22.8);
    let buffer2 = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    buffer2.upload(new Float32Array(points));
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, 1);
    gl.flush();
}
function initGL(gl, canvas) {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
function createSphere(radius, stacks, slices) {
    let ret = [];
    let lonstep = Math.PI / stacks;
    let latstep = Math.PI / slices;
    let x, y, z;
    for (let lon = 0.0; lon <= 2 * Math.PI; lon += (lonstep)) {
        for (let lat = 0.0; lat <= Math.PI + latstep; lat += latstep) {
            x = Math.cos(lon) * Math.sin(lat) * radius;
            y = Math.sin(lon) * Math.sin(lat) * radius;
            z = Math.cos(lat) * radius;
            ret.push(x, y, z);
            x = Math.cos(lon + lonstep) * Math.sin(lat) * radius;
            y = Math.sin(lon + lonstep) * Math.sin(lat) * radius;
            z = Math.cos(lat) * radius;
            ret.push(x, y, z);
        }
    }
    console.log(ret);
    return ret;
}
function pointOnSphere(radius, lon, lat) {
    let ret = [];
    let x = radius * Math.cos(lat) * Math.cos(lon);
    let y = radius * Math.cos(lat) * Math.sin(lon);
    let z = radius * Math.sin(lat);
    ret.push(x, y, z);
    return ret;
}
//# sourceMappingURL=main.js.map