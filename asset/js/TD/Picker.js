import { GL } from "./GL.js";
export class Picker {
    static readSinglePixel(x, y) {
        let data = new Uint8Array(4);
        this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
        return data;
    }
    static getIdentifier(readFromPixel) {
        return readFromPixel[0] +
            (readFromPixel[1] << 8) +
            (readFromPixel[2] << 16) +
            (readFromPixel[3] << 24);
    }
    static makeIdentifier(id) {
        return new Array(((id >> 0) & 0xFF) / 0xFF, ((id >> 8) & 0xFF) / 0xFF, ((id >> 16) & 0xFF) / 0xFF, ((id >> 24) & 0xFF) / 0xFF);
    }
    static select(x, y) {
        let data = this.readSinglePixel(x, y);
        return this.getIdentifier(data);
    }
}
Picker.gl = GL.instance;
//# sourceMappingURL=Picker.js.map