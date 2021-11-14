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

const gl = GL.instance;
let isDebug = false;
let dragging = false;
let old_mouse_x: number
let old_mouse_y: number;
let rotate_mouse_x: number = 0
let rotate_mouse_y: number = 0;
let canvas = <HTMLCanvasElement>document.getElementById("gl_canvas");

canvas?.addEventListener("mousedown", mouseDown, false);
canvas?.addEventListener("mouseup", mouseUp, false);
canvas?.addEventListener("mouseout", mouseUp, false);
canvas?.addEventListener("mousemove", mouseMove, false);
canvas?.addEventListener("wheel", mouseWheel, false);

// 카메라 설정
let orbitRadius = 100;
let zoom = 0.5;
let fov = Math.PI / 3
let aspect = 1.0;
let camera = new Camera(fov, aspect, 0.1, 200, orbitRadius, zoom, new vec3([0, 0, 0]), true);

// 지구 셰이더 생성
let vshader = new Shader("earth.vert", gl.VERTEX_SHADER);
let fshader = new Shader("earth.frag", gl.FRAGMENT_SHADER);
let prog = new ShaderProgram("earth", vshader, fshader);
prog.use();

// 항공기 셰이더 생성
let fvshader = new Shader("flight.vert", gl.VERTEX_SHADER);
let ffshader = new Shader("flight.frag", gl.FRAGMENT_SHADER);
let fprog = new ShaderProgram("flight", fvshader, ffshader);
fprog.use();


main();

async function main() {
    //초기 설정을 합니다.
    initGL();
    Earth.create(1.0, 36, 36);

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

    // 버퍼에 정점의 노말벡터 정보를 입력합니다.
    let normalBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    normalBuffer.upload(new Float32Array(Earth.normal));
    normalBuffer.unbind();

    // 정점 설정
    vertexBuffer.bind();
    prog.setVertexArrayObject("vPosition", vertexBuffer, 3, gl.FLOAT, false, 0, 0);
    vertexBuffer.unbind();

    // 텍스처 좌표 설정
    uvBuffer.bind();
    prog.setVertexArrayObject("vinTexturecoord", uvBuffer, 2, gl.FLOAT, false, 0, 0);
    uvBuffer.unbind();

    // 노말벡터 설정
    normalBuffer.bind();
    prog.setVertexArrayObject("vinTextureNormal", normalBuffer, 3, gl.FLOAT, false, 0, 0);
    normalBuffer.unbind();
    if (!isDebug) {
        //get clouds
        let host: string = "";
        let path: string = "";
        let url: string = "";
        let size: number = 8192;
        await DataProvider.getJson("https://api.rainviewer.com/public/weather-maps.json").then((data) => {
            //version: number
            //generated: number
            //host: string
            //radar/past time:number, path:string []
            //radar/nowcast time:number, path:string []
            //satellite/infrared time:number, path: string []
            host = data["host"];
            path = data["radar"]["nowcast"][0]["path"];
            url = host + path + "/" + size.toString() + "/2/0_1.png";
            console.log("[API REQUEST] GET", url);
            let cloudTexture = new Texture(url, gl.TEXTURE2);
            gl.uniform1i(prog.getUniformLocation("uCloudTexture"), 2);        
        });
    } else {
        let cloudTexture = new Texture("/asset/textures/earth_cloud_radar.png", gl.TEXTURE2);
        gl.uniform1i(prog.getUniformLocation("uCloudTexture"), 2);    
    }


    //낮 텍스처 설정
    let dayTexture = new Texture("/asset/textures/earth_day.jpg", gl.TEXTURE0);
    gl.uniform1i(prog.getUniformLocation("uDayTexture"), 0);

    //밤 텍스처 설정
    let nightTexture = new Texture("/asset/textures/earth_night.jpg", gl.TEXTURE1);
    gl.uniform1i(prog.getUniformLocation("uNightTexture"), 1);
    
    //let lightPos = Earth.lightPos(720);
    let lightPos = Earth.lightPosTime(1636632000);
    //빛 방향 설정
    gl.uniform3f(prog.getUniformLocation("uLightDir"), lightPos[0], lightPos[1], lightPos[2]);
    //gl.uniform3f(prog.getUniformLocation("uCameraLoc"), camera.cameraPosition!.at(0), camera.cameraPosition!.at(1), camera.cameraPosition!.at(2));

    //인덱스 버퍼 바인드
    indexBuffer.bind();
    
    //점 설정
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

function mouseDown(e: MouseEvent) {
    dragging = true;
    old_mouse_x = e.pageX;
    old_mouse_y = e.pageY;
    e.preventDefault();
}

function mouseUp(e: MouseEvent) {
    dragging = false;
    rotate_mouse_x = 0;
    rotate_mouse_y = 0;
    e.preventDefault();
}

function mouseMove(e: MouseEvent) {
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

function mouseWheel(e: WheelEvent) {
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
    //camera.RotateX(rotate_mouse_y);
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