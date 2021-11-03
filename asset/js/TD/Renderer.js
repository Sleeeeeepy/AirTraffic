export class Renderer {
    constructor(beforeDrawCallback, afterDrawCallback) {
        this.enable = false;
        this.renderers = new Array();
        this.beforeDrawCallback = beforeDrawCallback;
        this.afterDrawCallback = afterDrawCallback;
        this.draw = this.draw.bind(this);
    }
    addRenderer(renderer) {
        this.renderers.push(renderer);
    }
    draw() {
        this.beforeDrawCallback();
        for (let r in this.renderers) {
            this.renderers[r].draw();
        }
        this.afterDrawCallback();
        if (this.enable) {
            requestAnimationFrame(this.draw);
        }
    }
    requestAnimation() {
        this.enable = true;
        requestAnimationFrame(this.draw);
    }
}
//# sourceMappingURL=Renderer.js.map