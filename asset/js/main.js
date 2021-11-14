var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import vec3 from './tsm/vec3.js';
const gl = GL.instance;
let isDebug = false;
let dragging = false;
let old_mouse_x;
let old_mouse_y;
let rotate_mouse_x = 0;
let rotate_mouse_y = 0;
let canvas = document.getElementById("gl_canvas");
canvas === null || canvas === void 0 ? void 0 : canvas.addEventListener("mousedown", mouseDown, false);
canvas === null || canvas === void 0 ? void 0 : canvas.addEventListener("mouseup", mouseUp, false);
canvas === null || canvas === void 0 ? void 0 : canvas.addEventListener("mouseout", mouseUp, false);
canvas === null || canvas === void 0 ? void 0 : canvas.addEventListener("mousemove", mouseMove, false);
canvas === null || canvas === void 0 ? void 0 : canvas.addEventListener("wheel", mouseWheel, false);
let orbitRadius = 100;
let zoom = 0.5;
let fov = Math.PI / 3;
let aspect = 1.0;
let camera = new Camera(fov, aspect, 0.1, 200, orbitRadius, zoom, new vec3([0, 0, 0]), true);
let vshader = new Shader("earth.vert", gl.VERTEX_SHADER);
let fshader = new Shader("earth.frag", gl.FRAGMENT_SHADER);
let prog = new ShaderProgram("earth", vshader, fshader);
prog.use();
let fvshader = new Shader("flight.vert", gl.VERTEX_SHADER);
let ffshader = new Shader("flight.frag", gl.FRAGMENT_SHADER);
let fprog = new ShaderProgram("flight", fvshader, ffshader);
fprog.use();
main();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        initGL();
        Earth.create(1.0, 36, 36);
        let vertexBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        vertexBuffer.upload(new Float32Array(Earth.vertex));
        vertexBuffer.unbind();
        let indexBuffer = new Buffer(gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
        indexBuffer.uploadUShort(new Uint16Array(Earth.index));
        indexBuffer.unbind();
        let uvBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        uvBuffer.upload(new Float32Array(Earth.texcoord));
        uvBuffer.unbind();
        let normalBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        normalBuffer.upload(new Float32Array(Earth.normal));
        normalBuffer.unbind();
        vertexBuffer.bind();
        prog.setVertexArrayObject("vPosition", vertexBuffer, 3, gl.FLOAT, false, 0, 0);
        vertexBuffer.unbind();
        uvBuffer.bind();
        prog.setVertexArrayObject("vinTexturecoord", uvBuffer, 2, gl.FLOAT, false, 0, 0);
        uvBuffer.unbind();
        normalBuffer.bind();
        prog.setVertexArrayObject("vinTextureNormal", normalBuffer, 3, gl.FLOAT, false, 0, 0);
        normalBuffer.unbind();
        if (!isDebug) {
            let host = "";
            let path = "";
            let url = "";
            let size = 8192;
            yield DataProvider.getJson("https://api.rainviewer.com/public/weather-maps.json").then((data) => {
                host = data["host"];
                path = data["radar"]["nowcast"][0]["path"];
                url = host + path + "/" + size.toString() + "/2/0_1.png";
                console.log("[API REQUEST] GET", url);
                let cloudTexture = new Texture(url, gl.TEXTURE2);
                gl.uniform1i(prog.getUniformLocation("uCloudTexture"), 2);
            });
        }
        else {
            let cloudTexture = new Texture("/asset/textures/earth_cloud_radar.png", gl.TEXTURE2);
            gl.uniform1i(prog.getUniformLocation("uCloudTexture"), 2);
        }
        let dayTexture = new Texture("/asset/textures/earth_day.jpg", gl.TEXTURE0);
        gl.uniform1i(prog.getUniformLocation("uDayTexture"), 0);
        let nightTexture = new Texture("/asset/textures/earth_night.jpg", gl.TEXTURE1);
        gl.uniform1i(prog.getUniformLocation("uNightTexture"), 1);
        let lightPos = Earth.lightPosTime(1636632000);
        gl.uniform3f(prog.getUniformLocation("uLightDir"), lightPos[0], lightPos[1], lightPos[2]);
        indexBuffer.bind();
        let fvbo = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        let points = exampleCode();
        fvbo.upload(new Float32Array(points));
        fvbo.bind();
        let ptr = fprog.getAttributeLocation("vPosition");
        gl.enableVertexAttribArray(ptr);
        gl.vertexAttribPointer(ptr, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, 6);
        let scene = new Renderer(clear, rotate);
        scene.addRenderer(new ElementRenderer(indexBuffer, prog, gl.TRIANGLE_STRIP, drawEarth));
        scene.addRenderer(new ArrayRenderer(fvbo, 3, fprog, gl.POINTS, drawPoint));
        scene.requestAnimation();
    });
}
function initGL() {
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
function mouseDown(e) {
    dragging = true;
    old_mouse_x = e.pageX;
    old_mouse_y = e.pageY;
    e.preventDefault();
}
function mouseUp(e) {
    dragging = false;
    rotate_mouse_x = 0;
    rotate_mouse_y = 0;
    e.preventDefault();
}
function mouseMove(e) {
    if (!dragging)
        return;
    let dx = (e.pageX - old_mouse_x) / canvas.width;
    let dy = (e.pageY - old_mouse_y) / canvas.height;
    rotate_mouse_x += dx;
    rotate_mouse_y += dy;
    old_mouse_x = e.pageX;
    old_mouse_y = e.pageY;
    e.preventDefault();
}
function mouseWheel(e) {
    let move = e.deltaY * -0.001;
    if (camera.zoom + move < 0.5) {
        return;
    }
    if (camera.zoom + move > 3.0) {
        return;
    }
    camera.zoom += e.deltaY * -0.001;
    e.preventDefault();
}
function clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
function rotate() {
    camera.RotateZ(rotate_mouse_x);
}
function drawEarth() {
    gl.enable(gl.DEPTH_TEST);
    gl.uniformMatrix4fv(prog.getUniformLocation("uWorldMatrix"), false, camera.worldMatrix.all());
    gl.uniformMatrix4fv(prog.getUniformLocation("uViewMatrix"), false, camera.viewMatrix.all());
    gl.uniformMatrix4fv(prog.getUniformLocation("uProjectionMatrix"), false, camera.projectionMatrix.all());
}
function drawPoint() {
    gl.disable(gl.DEPTH_TEST);
    gl.uniformMatrix4fv(fprog.getUniformLocation("uWorldMatrix"), false, camera.worldMatrix.all());
    gl.uniformMatrix4fv(fprog.getUniformLocation("uViewMatrix"), false, camera.viewMatrix.all());
    gl.uniformMatrix4fv(fprog.getUniformLocation("uProjectionMatrix"), false, camera.projectionMatrix.all());
}
//# sourceMappingURL=main.js.map