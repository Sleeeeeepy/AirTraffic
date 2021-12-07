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
import { ImageTexture } from './TD/ImageTexture.js';
import mat4 from './tsm/mat4.js';
import vec3 from './tsm/vec3.js';
import { Texture } from './TD/Texture.js';
import { RenderBuffer } from './TD/RenderBuffer.js';
import { FrameBuffer } from './TD/FrameBuffer.js';
import { Utils } from './Utils.js';
import { Picker } from './TD/Picker.js';

const gl = GL.instance;
let isDebug = true;
let dragging = false;
let old_mouse_x: number
let old_mouse_y: number;
let rotate_mouse_x: number = 0
let rotate_mouse_y: number = 0;
let pick_mouse_x: number = -1;
let pick_mouse_y: number = -1;
let canvas = <HTMLCanvasElement>document.getElementById("gl_canvas");
let LastCloudUpdateTime: Date = new Date(1);
let LastFlightUpdateTime: Date = new Date(1);
let flightData: any;
let vertexData: Array<number>;
let isVertexDataUpdated: boolean = false;

canvas?.addEventListener("mousedown", mouseDown, false);
canvas?.addEventListener("mouseup", mouseUp, false);
canvas?.addEventListener("mouseout", mouseUp, false);
canvas?.addEventListener("mousemove", mouseMove, false);
canvas?.addEventListener("wheel", mouseWheel, false);
canvas?.addEventListener("click", mouseClick, false);

// 카메라 설정
let orbitRadius = 100;
let zoom = 0.5;
let fov = Math.PI / 3
let aspect = Utils.getAspect(canvas);
let camera = new Camera(fov, aspect, 1, 200, orbitRadius, zoom, new vec3([0, 0, 0]), true);

// 지구 셰이더 생성
let earthVertexShader = new Shader("earth.vert", gl.VERTEX_SHADER);
let earthFragmentShader = new Shader("earth.frag", gl.FRAGMENT_SHADER);
let prog = new ShaderProgram("earth", earthVertexShader, earthFragmentShader);
prog.use();

// 항공기 셰이더 생성
let flightVertexShader = new Shader("flight.vert", gl.VERTEX_SHADER);
let flightFragmentShader = new Shader("flight.frag", gl.FRAGMENT_SHADER);
let fprog = new ShaderProgram("flight", flightVertexShader, flightFragmentShader);
fprog.use();

// 선택 셰이터 생성
let pickVertexShader = new Shader("pick.vert", gl.VERTEX_SHADER);
let pickFragmentShader = new Shader("pick.frag", gl.FRAGMENT_SHADER);
let pickProgram = new ShaderProgram("picker", pickVertexShader, pickFragmentShader);

// 프레임 버퍼와 랜더 버퍼 생성
//let renderBuffer = new RenderBuffer(gl.DEPTH_COMPONENT16);
//let frameBuffer = new FrameBuffer();
//frameBuffer.bind();
let fvbo = new Buffer(gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
let ivbo = new Buffer(gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);

let framebuffer = new FrameBuffer();
let picker = new Picker(framebuffer);
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

    // 구름 텍스처 좌표 정보를 입력합니다.
    let cloudUvBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    cloudUvBuffer.upload(new Float32Array(Earth.cloudTexcoord));
    cloudUvBuffer.unbind();

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

    // 구름 텍스처 좌표 설정
    cloudUvBuffer.bind();
    prog.setVertexArrayObject("vinCloudTexturecoord", cloudUvBuffer, 2, gl.FLOAT, false, 0, 0);
    cloudUvBuffer.unbind();

    // 노말벡터 설정
    normalBuffer.bind();
    prog.setVertexArrayObject("vinTextureNormal", normalBuffer, 3, gl.FLOAT, false, 0, 0);
    normalBuffer.unbind();

    // 구름 텍스처 설정
    let cloudTexture = await setCloudTexture();

    // 낮 텍스처 설정
    let dayTexture = new ImageTexture("/asset/textures/earth_day.jpg", gl.TEXTURE0);
    gl.uniform1i(prog.getUniformLocation("uDayTexture"), 0);

    // 밤 텍스처 설정
    let nightTexture = new ImageTexture("/asset/textures/earth_night.jpg", gl.TEXTURE1);
    gl.uniform1i(prog.getUniformLocation("uNightTexture"), 1);

    let lightPos = Earth.lightPosTime(0);
    //빛 방향 설정
    gl.uniform3f(prog.getUniformLocation("uLightDir"), lightPos[0], lightPos[1], lightPos[2]);
    //gl.uniform3f(prog.getUniformLocation("uCameraLoc"), camera.cameraPosition!.at(0), camera.cameraPosition!.at(1), camera.cameraPosition!.at(2));

    //인덱스 버퍼 바인드
    indexBuffer.bind();

    //점 설정
    refreshFlightData();
    fvbo.upload(new Float32Array(flightData));
    fvbo.bind();
    let ptr = fprog.getAttributeLocation("vPosition");
    gl.enableVertexAttribArray(ptr);
    gl.vertexAttribPointer(ptr, 3, gl.FLOAT, false, 0, 0);
    //gl.drawArrays(gl.POINTS, 0, fvbo.length / 3);

    // 비행기 데이터 갱신
    setInterval(async () => {
        await refreshFlightData();
    }, 10000);

    // 구름 레이더 갱신
    setInterval(async () => {
        await refreshCloud(cloudTexture);
    }, 600000);

    // 랜더 텍스처, 랜더 버퍼, 프레임 버퍼 생성
    let textureToRender = new Texture();
    let renderbuffer = new RenderBuffer();
    renderbuffer.bind();
    function setFramebufferAttachmentSizes(width: number, height: number) {
        textureToRender.bind();
        textureToRender.texImage2D(width, height, null);
        renderbuffer.storage(gl.DEPTH_COMPONENT16, width, height);
    }
    framebuffer.bind();
    setFramebufferAttachmentSizes(canvas.width, canvas.height);
    framebuffer.setTexture2D(textureToRender);
    framebuffer.setRenderBufferDepthAttachment(renderbuffer);

    let scene = new Renderer(clear, rotate);
    scene.addRenderer(new ElementRenderer(indexBuffer, prog, gl.TRIANGLES, gl.UNSIGNED_SHORT, drawEarth));
    scene.addRenderer(new ArrayRenderer(fvbo, 3, fprog, gl.POINTS, drawPoint));
    scene.addRenderer(new ArrayRenderer(fvbo, 3, pickProgram, gl.POINTS, drawPointOffscreen))
    scene.requestAnimation();

    function drawEarth() {
        framebuffer.unbind();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.uniformMatrix4fv(prog.getUniformLocation("uWorldMatrix"), false, camera.worldMatrix.all());
        gl.uniformMatrix4fv(prog.getUniformLocation("uViewMatrix"), false, camera.viewMatrix.all());
        gl.uniformMatrix4fv(prog.getUniformLocation("uProjectionMatrix"), false, camera.projectionMatrix.all());
    }

    function drawPoint() {
        framebuffer.unbind();
        gl.uniformMatrix4fv(fprog.getUniformLocation("uWorldMatrix"), false, camera.worldMatrix.all());
        gl.uniformMatrix4fv(fprog.getUniformLocation("uViewMatrix"), false, camera.viewMatrix.all());
        gl.uniformMatrix4fv(fprog.getUniformLocation("uProjectionMatrix"), false, camera.projectionMatrix.all());
    }

    function drawPointOffscreen() {
        framebuffer.bind();
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.uniformMatrix4fv(pickProgram.getUniformLocation("uWorldMatrix"), false, camera.worldMatrix.all());
        gl.uniformMatrix4fv(pickProgram.getUniformLocation("uViewMatrix"), false, camera.viewMatrix.all());
        gl.uniformMatrix4fv(pickProgram.getUniformLocation("uProjectionMatrix"), false, camera.projectionMatrix.all());
    }

    function clear() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (isVertexDataUpdated) {
            isVertexDataUpdated = false;
    
            fvbo.bind();
            fvbo.upload(new Float32Array(vertexData));
    
            ivbo.bind();
            ivbo.upload(new Float32Array(createIndex()));
    
            fvbo.bind();
            let fvPosition = fprog.getAttributeLocation("vPosition");
            gl.vertexAttribPointer(fvPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(fvPosition);
            
            let pvPosition = pickProgram.getAttributeLocation("vPosition");
            gl.vertexAttribPointer(pvPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(pvPosition);
            
            ivbo.bind();
            let pvinColor = pickProgram.getAttributeLocation("vinColor");
            gl.vertexAttribPointer(pvinColor, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(pvinColor);
        }
    
        if (Utils.resizeCanvas(canvas)) {
            setFramebufferAttachmentSizes(gl.canvas.width, gl.canvas.height);
        }
    }
}

function initGL() {
    gl.frontFace(gl.CCW);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
}

function mouseClick(e: MouseEvent) {
    let pX = pick_mouse_x * gl.canvas.width / gl.canvas.clientWidth;
    let pY = gl.canvas.height - pick_mouse_y * gl.canvas.height / gl.canvas.clientHeight - 1;
    let picked_flight = picker.select(pX, pY);
    showFlightInfo(picked_flight);
}

function showFlightInfo(index: number) {
    if (index >= 0) {
        //show flight data...
    } else {
        return;
    }
}

function mouseMove(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    pick_mouse_x = e.clientX - rect.left;
    pick_mouse_y = e.clientY - rect.top;
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
    if (camera.zoom + move > 4.0) {
        return;
    }
    camera.zoom += e.deltaY * -0.001;
    e.preventDefault();
}

function createIndex(): Array<number> {
    let arr = new Array<number>();
    for (let i = 0; i < flightData["states"].length; i++) {
        let id = Picker.makeIdentifier(i);
        arr.push(id[0], id[1], id[2], id[3]);
    }
    return arr;
}

function rotate() {
    // using matrix transformation with euler angles.
    //camera.RotateX(rotate_mouse_y);
    //camera.RotateZ(rotate_mouse_x);

    // using quaternion with euler angles.
    if (dragging) {
        camera.RotateQuatEuler(rotate_mouse_y, 0, rotate_mouse_x);
    }
}

// version: number
// generated: number
// host: string
// radar/past time:number, path:string []
// radar/nowcast time:number, path:string []
// satellite/infrared time:number, path: string []
async function setCloudTexture(): Promise<ImageTexture> {
    let cloudTexture;
    if (!isDebug) {
        //get clouds url
        let host: string = "";
        let path: string = "";
        let url: string = "";
        let size: number = 8192;
        await DataProvider.getJson("https://api.rainviewer.com/public/weather-maps.json").then((data) => {
            host = data["host"];
            path = data["radar"]["nowcast"][0]["path"];
            url = host + path + "/" + size.toString() + "/2/0_1.png";
            // make imaged texture.
            console.log("[API REQUEST] GET", url);
            cloudTexture = new ImageTexture(url, gl.TEXTURE2);
            gl.uniform1i(prog.getUniformLocation("uCloudTexture"), 2);
        });
    } else {
        cloudTexture = new ImageTexture("/asset/textures/earth_cloud_radar.png", gl.TEXTURE2);
        gl.uniform1i(prog.getUniformLocation("uCloudTexture"), 2);
    }

    if (!cloudTexture) {
        throw new Error("cloudTextrue error.");
    }
    return cloudTexture;
}

// 코드가 중복됩니다. 시간 남으면 수정해주세요.
async function refreshCloud(cloudTexture: ImageTexture): Promise<void> {
    if (!Utils.isUpdatable(LastCloudUpdateTime, 600000)) { // 10 min
        return;
    }
    if (!isDebug) {
        //get clouds
        let host: string = "";
        let path: string = "";
        let url: string = "";
        let size: number = 8192;
        await DataProvider.getJson("https://api.rainviewer.com/public/weather-maps.json").then((data) => {
            host = data["host"];
            path = data["radar"]["nowcast"][0]["path"];
            url = host + path + "/" + size.toString() + "/2/0_1.png";
            // change image.
            console.log("[API REQUEST] IMAGE GET", url);
            cloudTexture.changeImage(url);
        });
        if (!cloudTexture) {
            throw new Error("cloudTextrue error.");
        }
        LastCloudUpdateTime = new Date();
        console.log("[", LastCloudUpdateTime.toUTCString(), "]", "Cloud data is refreshed.");
    }
}


// time: epoch
// states: Array<FlightData>
// FlightData is
// ...
async function refreshFlightData(): Promise<void> {
    //get flight data per 10 sec
    if (!Utils.isUpdatable(LastFlightUpdateTime, 10000)) {
        return;
    }
    function resolveFlightData(data: any) {
        let arr = new Array<number>();
        for (let i = 0; i < data["states"].length; i++) {
            let lon = data["states"][i][6];
            let lat = data["states"][i][5];
            let point = Earth.pointAt(1.01, lat, lon);
            arr.push(point[0], point[1], point[2]);
        }
        return arr;
    }
    await DataProvider.getJson("https://opensky-network.org/api/states/all").then((data) => {
        flightData = data;
    });
    LastFlightUpdateTime = new Date();
    vertexData = resolveFlightData(flightData);
    isVertexDataUpdated = true;
    console.log("[", LastFlightUpdateTime.toUTCString(), "]", "Flight data is refreshed.");
}
/*
function texture_render_init(frameBuffer: FrameBuffer, renderBuffer: RenderBuffer, x: number, y: number): Texture {
    let tex = new Texture(null, x, y);
    frameBuffer.bind();
    renderBuffer.bind();
    frameBuffer.setTexture2D(tex.getWebGLTexture());
    frameBuffer.setRenderBufferDepthAttachment(renderBuffer);
    return tex;
}

function adjustFramebufferAttSize(renderBuffer: RenderBuffer, texture: Texture, x: number, y: number) {
    texture.bind();
    texture.refresh(x, y);
    renderBuffer.storage(gl.DEPTH_COMPONENT16, x, y);
}
*/