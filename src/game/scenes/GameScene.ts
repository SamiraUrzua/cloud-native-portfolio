import Phaser from 'phaser';
import { Player } from '@/game/entities/Player';
import { PerformanceOverlay } from '@/game/utils/PerformanceOverlay';
import { circleOverlapsShapes, PLAYER_COLLIDER_RADIUS } from '@/game/world/Collision';
import { DEBUG_DRAW_LAYERS, Level } from '@/game/world/Level';

const TARGET_VISIBLE_WORLD_SIDE = 300;
const DEFAULT_SPAWN_NAME = 'Player';
const MAP_FADE_DURATION_MS = 200;

interface GameSceneData {
    mapKey: string;
    spawnName?: string;
}

export class GameScene extends Phaser.Scene {
    private mapKey!: string;
    private spawnName!: string;
    private keys!: Record<string, Phaser.Input.Keyboard.Key>;
    private level!: Level;
    private player!: Player;
    private performanceOverlay!: PerformanceOverlay;
    private playerColliderDebugGraphics: Phaser.GameObjects.Graphics | undefined;
    private isSwitchingMap = false;
    private isPointerHoldingMovement = false;

    constructor() {
        super('GameScene');
    }

    init(data: GameSceneData): void {
        this.mapKey = data.mapKey;
        this.spawnName = data.spawnName ?? DEFAULT_SPAWN_NAME;
        this.isSwitchingMap = false;
        this.isPointerHoldingMovement = false;
    }

    create(): void {
        this.level = new Level(this, this.mapKey);

        const spawnPoint = this.level.spawnPoints.get(this.spawnName);
        if (!spawnPoint) {
            throw new Error(`GameScene: spawn "${this.spawnName}" not found in map "${this.mapKey}"`);
        }

        this.player = new Player(this, spawnPoint.x, spawnPoint.y);
        this.player.heightLevel = spawnPoint.heightLevel;

        this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT') as Record<string, Phaser.Input.Keyboard.Key>;
        this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.isPointerHoldingMovement = true;
        });
        const releasePointerMovement = () => {
            this.isPointerHoldingMovement = false;
            this.player.stopMovement();
        };
        this.input.on(Phaser.Input.Events.POINTER_UP, releasePointerMovement);

        const releaseWhenNoButtonIsPressed = (event: PointerEvent) => {
            if (event.buttons === 0) releasePointerMovement();
        };
        window.addEventListener('pointerup', releasePointerMovement);
        window.addEventListener('pointercancel', releasePointerMovement);
        window.addEventListener('pointermove', releaseWhenNoButtonIsPressed);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            window.removeEventListener('pointerup', releasePointerMovement);
            window.removeEventListener('pointercancel', releasePointerMovement);
            window.removeEventListener('pointermove', releaseWhenNoButtonIsPressed);
        });

        this.cameras.main.setBounds(0, 0, this.level.widthInPixels, this.level.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 1, 1);
        this.cameras.main.fadeIn(MAP_FADE_DURATION_MS);

        const applyCameraZoom = (gameSize: Phaser.Structs.Size) => {
            const screenSide = Math.sqrt(gameSize.width * gameSize.height);
            this.cameras.main.setZoom(Math.max(1, Math.round(screenSide / TARGET_VISIBLE_WORLD_SIDE)));
        };
        applyCameraZoom(this.scale.gameSize);
        this.scale.on(Phaser.Scale.Events.RESIZE, applyCameraZoom);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, applyCameraZoom));

        this.performanceOverlay = new PerformanceOverlay(this);
        this.playerColliderDebugGraphics = DEBUG_DRAW_LAYERS['PlayerCollider'] ? this.add.graphics().setDepth(1000) : undefined;
    }

    update(_time: number, deltaMilliseconds: number): void {
        if (this.isSwitchingMap) return;

        const updateStartTimestamp = performance.now();
        const { activePointer } = this.input;

        if (this.isPointerHoldingMovement && activePointer.isDown) {
            const worldPoint = this.cameras.main.getWorldPoint(activePointer.x, activePointer.y);
            this.player.moveTo(worldPoint.x, worldPoint.y);
        }

        this.player.setMoveDirection(
            Number(this.keys.D.isDown || this.keys.RIGHT.isDown) - Number(this.keys.A.isDown || this.keys.LEFT.isDown),
            Number(this.keys.S.isDown || this.keys.DOWN.isDown) - Number(this.keys.W.isDown || this.keys.UP.isDown)
        );
        this.player.update(this.level, deltaMilliseconds);
        this.playerColliderDebugGraphics?.clear().lineStyle(1, 0x00ff00, 1).strokeCircle(this.player.x, this.player.y, PLAYER_COLLIDER_RADIUS);

        const touchedTrigger = this.level.triggers.find((levelTrigger) =>
            circleOverlapsShapes(this.player.x, this.player.y, levelTrigger.segments, levelTrigger.circles)
        );

        if (touchedTrigger) {
            const action = touchedTrigger.action;
            if (action.type === 'heightLevel') {
                this.player.heightLevel = action.targetHeightLevel;
            } else {
                this.isSwitchingMap = true;
                this.cameras.main.fadeOut(MAP_FADE_DURATION_MS);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.restart({ mapKey: action.targetMapKey, spawnName: action.targetSpawnName });
                });
            }
        }

        this.performanceOverlay.recordFrame(performance.now() - updateStartTimestamp);
    }
}