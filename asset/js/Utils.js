export class Utils {
    static isUpdatable(lastUpdateTime, updateInterval_ms) {
        let current = new Date();
        if (!lastUpdateTime) {
            return true;
        }
        if (current <= lastUpdateTime) {
            return false;
        }
        else if (lastUpdateTime.getTime() + updateInterval_ms > current.getTime()) {
            return false;
        }
        return true;
    }
    static resizeCanvas(canvas) {
        let w = canvas.clientWidth;
        let h = canvas.clientHeight;
        if (canvas.width != w || canvas.height != h) {
            canvas.width = w;
            canvas.height = h;
            return true;
        }
        return false;
    }
    static getAspect(canvas) {
        let w = canvas.clientWidth;
        let h = canvas.clientHeight;
        return w / h;
    }
}
//# sourceMappingURL=Utils.js.map