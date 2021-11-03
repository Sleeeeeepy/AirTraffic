import { IRenderer } from "./IRenderer.js";

export class Renderer implements IRenderer {
    private renderers: IRenderer[]
    private beforeDrawCallback: () => void;
    private afterDrawCallback: () => void;
    public enable: boolean = false;

    public constructor(beforeDrawCallback: () => void, afterDrawCallback: () => void) {
        this.renderers = new Array<IRenderer>();
        this.beforeDrawCallback = beforeDrawCallback;
        this.afterDrawCallback = afterDrawCallback;
        this.draw = this.draw.bind(this);
    }

    public addRenderer(renderer: IRenderer) {
        this.renderers.push(renderer);
    }

    public draw(): void {
        this.beforeDrawCallback();
        for (let r in this.renderers) {
            this.renderers[r].draw();
        }
        this.afterDrawCallback();

        if (this.enable) {
            requestAnimationFrame(this.draw);
        }
    }

    public requestAnimation(): void {
        this.enable = true;
        requestAnimationFrame(this.draw);
    }
}