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
import { ImageTexture } from './TD/ImageTexture.js';
import vec3 from './tsm/vec3.js';
import { Texture } from './TD/Texture.js';
import { RenderBuffer } from './TD/RenderBuffer.js';
import { FrameBuffer } from './TD/FrameBuffer.js';
import { Utils } from './Utils.js';
import { Picker } from './TD/Picker.js';
const gl = GL.instance;
let isDebug = true;
let dragging = false;
let old_mouse_x;
let old_mouse_y;
let rotate_mouse_x = 0;
let rotate_mouse_y = 0;
let pick_mouse_x = -1;
let pick_mouse_y = -1;
let canvas = document.getElementById("gl_canvas");
let LastCloudUpdateTime = new Date(1);
let LastFlightUpdateTime = new Date(1);
let flightData;
let vertexData;
let isVertexDataUpdated = false;
canvas === null || canvas === void 0 ? void 0 : canvas.addEventListener("mousedown", mouseDown, false);
canvas === null || canvas === void 0 ? void 0 : canvas.addEventListener("mouseup", mouseUp, false);
canvas === null || canvas === void 0 ? void 0 : canvas.addEventListener("mouseout", mouseUp, false);
canvas === null || canvas === void 0 ? void 0 : canvas.addEventListener("mousemove", mouseMove, false);
canvas === null || canvas === void 0 ? void 0 : canvas.addEventListener("wheel", mouseWheel, false);
canvas === null || canvas === void 0 ? void 0 : canvas.addEventListener("click", mouseClick, false);
let orbitRadius = 100;
let zoom = 0.5;
let fov = Math.PI / 3;
let aspect = Utils.getAspect(canvas);
let camera = new Camera(fov, aspect, 1, 200, orbitRadius, zoom, new vec3([0, 0, 0]), true);
let earthVertexShader = new Shader("earth.vert", gl.VERTEX_SHADER);
let earthFragmentShader = new Shader("earth.frag", gl.FRAGMENT_SHADER);
let prog = new ShaderProgram("earth", earthVertexShader, earthFragmentShader);
prog.use();
let flightVertexShader = new Shader("flight.vert", gl.VERTEX_SHADER);
let flightFragmentShader = new Shader("flight.frag", gl.FRAGMENT_SHADER);
let fprog = new ShaderProgram("flight", flightVertexShader, flightFragmentShader);
fprog.use();
let pickVertexShader = new Shader("pick.vert", gl.VERTEX_SHADER);
let pickFragmentShader = new Shader("pick.frag", gl.FRAGMENT_SHADER);
let pprog = new ShaderProgram("picker", pickVertexShader, pickFragmentShader);
let fvbo = new Buffer(gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
let ivbo = new Buffer(gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
let framebuffer = new FrameBuffer();
let picker = new Picker(framebuffer);
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
        let cloudUvBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        cloudUvBuffer.upload(new Float32Array(Earth.cloudTexcoord));
        cloudUvBuffer.unbind();
        let normalBuffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        normalBuffer.upload(new Float32Array(Earth.normal));
        normalBuffer.unbind();
        vertexBuffer.bind();
        prog.setVertexArrayObject("vPosition", vertexBuffer, 3, gl.FLOAT, false, 0, 0);
        vertexBuffer.unbind();
        uvBuffer.bind();
        prog.setVertexArrayObject("vinTexturecoord", uvBuffer, 2, gl.FLOAT, false, 0, 0);
        uvBuffer.unbind();
        cloudUvBuffer.bind();
        prog.setVertexArrayObject("vinCloudTexturecoord", cloudUvBuffer, 2, gl.FLOAT, false, 0, 0);
        cloudUvBuffer.unbind();
        normalBuffer.bind();
        prog.setVertexArrayObject("vinTextureNormal", normalBuffer, 3, gl.FLOAT, false, 0, 0);
        normalBuffer.unbind();
        let cloudTexture = yield setCloudTexture();
        let dayTexture = new ImageTexture("/asset/textures/earth_day.jpg", gl.TEXTURE0);
        gl.uniform1i(prog.getUniformLocation("uDayTexture"), 0);
        let nightTexture = new ImageTexture("/asset/textures/earth_night.jpg", gl.TEXTURE1);
        gl.uniform1i(prog.getUniformLocation("uNightTexture"), 1);
        let lightPos = Earth.lightPosTime(0);
        gl.uniform3f(prog.getUniformLocation("uLightDir"), lightPos[0], lightPos[1], lightPos[2]);
        indexBuffer.bind();
        refreshFlightData();
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield refreshFlightData();
        }), 10000);
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield refreshCloud(cloudTexture);
        }), 600000);
        let textureToRender = new Texture();
        let renderbuffer = new RenderBuffer();
        renderbuffer.bind();
        function setFramebufferAttachmentSizes(width, height) {
            textureToRender.bind();
            textureToRender.texImage2D(width, height, null);
            renderbuffer.storage(gl.DEPTH_COMPONENT16, width, height);
        }
        framebuffer.bind();
        gl.enable(gl.CULL_FACE);
        setFramebufferAttachmentSizes(canvas.width, canvas.height);
        framebuffer.setTexture2D(textureToRender);
        framebuffer.setRenderBufferDepthAttachment(renderbuffer);
        let scene = new Renderer(clear, rotate);
        scene.addRenderer(new ElementRenderer(indexBuffer, prog, gl.TRIANGLES, gl.UNSIGNED_SHORT, drawEarth));
        scene.addRenderer(new ArrayRenderer(fvbo, 3, fprog, gl.POINTS, drawPoint));
        scene.addRenderer(new ArrayRenderer(fvbo, 3, pprog, gl.POINTS, drawPointOffscreen));
        scene.requestAnimation();
        function drawEarth() {
            framebuffer.unbind();
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
            gl.uniformMatrix4fv(pprog.getUniformLocation("uWorldMatrix"), false, camera.worldMatrix.all());
            gl.uniformMatrix4fv(pprog.getUniformLocation("uViewMatrix"), false, camera.viewMatrix.all());
            gl.uniformMatrix4fv(pprog.getUniformLocation("uProjectionMatrix"), false, camera.projectionMatrix.all());
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
                let pvPosition = pprog.getAttributeLocation("vPosition");
                gl.vertexAttribPointer(pvPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(pvPosition);
                ivbo.bind();
                let pvinColor = pprog.getAttributeLocation("vinColor");
                gl.vertexAttribPointer(pvinColor, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(pvinColor);
            }
            if (Utils.resizeCanvas(canvas)) {
                setFramebufferAttachmentSizes(gl.canvas.width, gl.canvas.height);
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            }
        }
    });
}
function initGL() {
    gl.frontFace(gl.CCW);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
}
function mouseClick(e) {
    let pX = pick_mouse_x * gl.canvas.width / gl.canvas.clientWidth;
    let pY = gl.canvas.height - pick_mouse_y * gl.canvas.height / gl.canvas.clientHeight - 1;
    let picked_flight = picker.select(pX, pY);
    showFlightInfo(picked_flight, e.clientX, e.clientY);
}
function showFlightInfo(index, mouse_x, mouse_y) {
    let infobox = document.getElementById("box");
    let text = document.getElementById("boxinner");
    if (!infobox || !text) {
        return;
    }
    if (index >= 0) {
        infobox.style.display = 'block';
        infobox.style.left = `${mouse_x.toString()}px`;
        infobox.style.top = `${mouse_y.toString()}px`;
        let icao24 = flightData["states"][index][0];
        let callsign = flightData["states"][index][1];
        let origin_country = flightData["states"][index][2];
        let time_position = flightData["states"][index][3];
        let last_contact = flightData["states"][index][4];
        let longitude = flightData["states"][index][5];
        let latitude = flightData["states"][index][6];
        let baro_altitude = flightData["states"][index][7];
        let on_ground = flightData["states"][index][8];
        let velocity = flightData["states"][index][9];
        let true_track = flightData["states"][index][10];
        let vertical_rate = flightData["states"][index][11];
        let sensors = flightData["states"][index][12];
        let geo_altitude = flightData["states"][index][13];
        let squawk = flightData["states"][index][14];
        let spi = flightData["states"][index][15];
        let posSrc = flightData["states"][index][16];
        let posSrcString;
        if (posSrc == 0) {
            posSrcString = "ADS-B";
        }
        else if (posSrc == 1) {
            posSrcString = "ASTERIX";
        }
        else if (posSrc == 2) {
            posSrcString = "MLAT";
        }
        else {
            posSrcString = "unknown";
        }
        text.innerText = `icao24: ${icao24}\n`;
        if (callsign) {
            text.innerText += `callsign: ${callsign}\n`;
        }
        text.innerText += `origin: ${origin_country}\n`;
        text.innerText += `longitude: ${longitude}\n`;
        text.innerText += `latitude: ${latitude}\n`;
        if (geo_altitude) {
            text.innerText += `altitude: ${geo_altitude}m\n`;
        }
        if (baro_altitude) {
            text.innerText += `barometric altitude: ${baro_altitude}m\n`;
        }
        if (velocity) {
            text.innerText += `velocity: ${(velocity * 3.6).toFixed(2)}km/h\n`;
        }
        text.innerText += `data from ${posSrcString}`;
    }
    else {
        infobox.style.display = 'none';
        return;
    }
}
function mouseMove(e) {
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
function mouseWheel(e) {
    let move = e.deltaY * -0.001;
    if (camera.zoom + move < 0.5) {
        return;
    }
    if (camera.zoom + move > 8.0) {
        return;
    }
    camera.zoom += e.deltaY * -0.001;
    e.preventDefault();
}
function createIndex() {
    let arr = new Array();
    for (let i = 0; i < flightData["states"].length; i++) {
        let id = Picker.makeIdentifier(i);
        arr.push(id[0], id[1], id[2], id[3]);
    }
    return arr;
}
function rotate() {
    if (dragging) {
        camera.RotateQuatEuler(rotate_mouse_y, 0, rotate_mouse_x);
    }
}
function setCloudTexture() {
    return __awaiter(this, void 0, void 0, function* () {
        let cloudTexture;
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
                cloudTexture = new ImageTexture(url, gl.TEXTURE2);
                gl.uniform1i(prog.getUniformLocation("uCloudTexture"), 2);
            });
        }
        else {
            cloudTexture = new ImageTexture("/asset/textures/earth_cloud_radar.png", gl.TEXTURE2);
            gl.uniform1i(prog.getUniformLocation("uCloudTexture"), 2);
        }
        if (!cloudTexture) {
            throw new Error("cloudTextrue error.");
        }
        return cloudTexture;
    });
}
function refreshCloud(cloudTexture) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!Utils.isUpdatable(LastCloudUpdateTime, 600000)) {
            return;
        }
        if (!isDebug) {
            let host = "";
            let path = "";
            let url = "";
            let size = 8192;
            yield DataProvider.getJson("https://api.rainviewer.com/public/weather-maps.json").then((data) => {
                host = data["host"];
                path = data["radar"]["nowcast"][0]["path"];
                url = host + path + "/" + size.toString() + "/2/0_1.png";
                console.log("[API REQUEST] IMAGE GET", url);
                cloudTexture.changeImage(url);
            });
            if (!cloudTexture) {
                throw new Error("cloudTextrue error.");
            }
            LastCloudUpdateTime = new Date();
            console.log("[", LastCloudUpdateTime.toUTCString(), "]", "Cloud data is refreshed.");
        }
    });
}
function refreshFlightData() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!Utils.isUpdatable(LastFlightUpdateTime, 10000)) {
            return;
        }
        function resolveFlightData(data) {
            let arr = new Array();
            for (let i = 0; i < data["states"].length; i++) {
                let lon = data["states"][i][6];
                let lat = data["states"][i][5];
                let point = Earth.pointAt(1.01, lat, lon);
                arr.push(point[0], point[1], point[2]);
            }
            return arr;
        }
        yield DataProvider.getJson("https://opensky-network.org/api/states/all").then((data) => {
            flightData = data;
        });
        LastFlightUpdateTime = new Date();
        vertexData = resolveFlightData(flightData);
        isVertexDataUpdated = true;
        console.log("[", LastFlightUpdateTime.toUTCString(), "]", "Flight data is refreshed.");
    });
}
//# sourceMappingURL=main.js.map