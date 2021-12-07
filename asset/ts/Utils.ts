export class Utils {
    public static isUpdatable(lastUpdateTime: Date, updateInterval_ms: number): boolean {
        let current = new Date();
        if (!lastUpdateTime) {
            return true;
        }
        if (current <= lastUpdateTime) {
            return false;
        } else if (lastUpdateTime.getTime() + updateInterval_ms > current.getTime()) {
            return false;
        }
        return true;
    }

    public static resizeCanvas(canvas: HTMLCanvasElement): boolean {
        let w = canvas.clientWidth;
        let h = canvas.clientHeight;
        if (canvas.width != w || canvas.height != h) {
            canvas.width = w;
            canvas.height = h;
            return true;
        }
        return false;
    }

    public static getAspect(canvas: HTMLCanvasElement): number {
        let w = canvas.clientWidth;
        let h = canvas.clientHeight;
        return w / h;
    }
}