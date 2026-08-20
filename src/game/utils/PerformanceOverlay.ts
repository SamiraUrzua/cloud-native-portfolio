import Phaser from 'phaser';

const REFRESH_INTERVAL_MS = 500;
const BYTES_PER_MEGABYTE = 1024 * 1024;

interface ChromePerformance extends Performance {
    memory?: { usedJSHeapSize: number };
}

export class PerformanceOverlay {
    private readonly element: HTMLDivElement;
    private readonly scene: Phaser.Scene;
    private accumulatedUpdateMs = 0;
    private worstUpdateMs = 0;
    private measuredFrames = 0;
    private lastRefreshTimestamp = performance.now();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.element = document.createElement('div');
        Object.assign(this.element.style, {
            position: 'fixed',
            top: '4px',
            left: '4px',
            padding: '4px 6px',
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#00ff00',
            font: '12px monospace',
            whiteSpace: 'pre',
            pointerEvents: 'none',
            zIndex: '1000',
        });
        document.body.appendChild(this.element);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.element.remove());
    }

    recordFrame(updateDurationMs: number): void {
        this.accumulatedUpdateMs += updateDurationMs;
        this.worstUpdateMs = Math.max(this.worstUpdateMs, updateDurationMs);
        this.measuredFrames++;

        const now = performance.now();
        if (now - this.lastRefreshTimestamp < REFRESH_INTERVAL_MS) return;

        const gameLoop = this.scene.game.loop;
        const usedHeapBytes = (performance as ChromePerformance).memory?.usedJSHeapSize;
        const heapLabel = usedHeapBytes === undefined ? 'n/a' : `${(usedHeapBytes / BYTES_PER_MEGABYTE).toFixed(1)} MB`;
        const rendererLabel = this.scene.game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas';

        this.element.textContent = [
            `FPS      ${gameLoop.actualFps.toFixed(0)}`,
            `Frame    ${gameLoop.delta.toFixed(1)} ms`,
            `Update   ${(this.accumulatedUpdateMs / this.measuredFrames).toFixed(2)} ms avg / ${this.worstUpdateMs.toFixed(2)} ms max`,
            `Objects  ${this.scene.children.length}`,
            `Heap     ${heapLabel}`,
            `Renderer ${rendererLabel}`,
        ].join('\n');

        this.accumulatedUpdateMs = 0;
        this.worstUpdateMs = 0;
        this.measuredFrames = 0;
        this.lastRefreshTimestamp = now;
    }
}
