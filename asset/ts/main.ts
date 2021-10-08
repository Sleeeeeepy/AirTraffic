import {Buffer} from './TD/Buffer.js';
import {Earth} from './TD/Earth.js';
import {GL} from './TD/GL.js';
import {Shader} from './TD/Shader.js';
import {ShaderProgram} from './TD/ShaderProgram.js'; 

// entry point
main();

function main() {
    //초기 설정을 합니다.
    const canvas = <HTMLCanvasElement>document.getElementById("gl_canvas");
    const gl = GL.instance;
    initGL(gl, canvas);
    /*
    window.onresize = function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height); 
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 4);   
    };
    */

    // 다음 코드부터는 임시 코드입니다.
    // 버퍼에 정점 정보를 입력합니다.
    let buffer = new Buffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    // let verts = new Float32Array(createSphere(1.0, 18, 18));
    Earth.create(1.0, 36);
    let verts = new Float32Array(Earth.vertice);
    buffer.upload(verts);
    // 셰이더 객체 생성
    let vshader = new Shader("simple1.vert", gl.VERTEX_SHADER);
    let fshader = new Shader("simple1.frag", gl.FRAGMENT_SHADER);

    // 셰이더 프로그램 생성
    let prog = new ShaderProgram("shader");
    let cprog = prog.getShaderProgram(vshader, fshader);
    prog.use();

    // 어트리뷰트 설정
    let vertexPositionAttribute = gl.getAttribLocation(cprog, "vPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    // draw
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

function initGL(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
    //gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
/*
function createSphere(radius: number, lon: number, lat: number) {
    let vertice = [];
    let normal = [];
    let texcoord = [];
    let index = [];

    let u, v, ux, uy, uz, phi, theta, sp, cp, st, ct;
    for (let i = 0; i <= lon; i++) {
        for (let j = 0; j <= lat; j++) {
            u = i / lat;
            v = j / lon;
            theta = radius * u;
            phi = radius * v;
            st = Math.sin(theta);
            ct = Math.cos(theta);
            sp = Math.sin(phi);
            cp = Math.cos(phi);
            ux = ct * sp;
            uy = cp;
            uz = st * sp;
            vertice.push(radius * ux, radius * uy, radius * uz);
            normal.push(ux, uy, uz);
            texcoord.push(1 - u, v);
        }
    }
}
*/
function createSphere(radius: number, stacks: number, slices: number) {
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

function pointOnSphere(radius: number, lon: number, lat: number) {
    let ret = [];
    let latRad = lat * (Math.PI / 180);
    let lonRad= -lon * (Math.PI / 180);
    let x = Math.cos(latRad) * Math.cos(lonRad) * radius;
    let y = Math.sin(latRad) * radius;
    let z = Math.cos(latRad) * Math.sin(lonRad) * radius
    ret.push(x,y,z);
    return ret;
}