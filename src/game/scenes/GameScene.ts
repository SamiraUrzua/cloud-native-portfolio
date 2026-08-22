import Phaser from 'phaser';
import { Player, PLAYER_COLLIDER_RADIUS } from '@/game/entities/Player';
import { PerformanceOverlay } from '@/game/utils/PerformanceOverlay';
import { circleOverlapsShapes } from '@/game/world/Collision';
import { Level, LevelTrigger } from '@/game/world/Level';

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
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
    private level!: Level;
    private player!: Player;
    private performanceOverlay!: PerformanceOverlay;
    private isSwitchingMap = false;

    constructor() {
        super('GameScene');
    }

    init(data: GameSceneData): void {
        this.mapKey = data.mapKey;
        this.spawnName = data.spawnName ?? DEFAULT_SPAWN_NAME;
        this.isSwitchingMap = false;
    }

    create(): void {
        this.level = new Level(this, this.mapKey);

        const spawnPoint = this.level.spawnPoints.get(this.spawnName);
        if (!spawnPoint) {
            throw new Error(`GameScene: spawn "${this.spawnName}" not found in map "${this.mapKey}"`);
        }

        this.player = new Player(this, spawnPoint.x, spawnPoint.y);
        this.player.heightLevel = spawnPoint.heightLevel;
        this.player.setDepth(this.level.playerDepth);

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as typeof this.wasd;
        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => this.setDestinationFromPointer(pointer));
        this.input.on(Phaser.Input.Events.POINTER_UP, () => this.player.stopMovement());

        this.cameras.main.setBounds(0, 0, this.level.widthInPixels, this.level.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.fadeIn(MAP_FADE_DURATION_MS);

        const applyCameraZoom = (gameSize: Phaser.Structs.Size) => {
            const screenSide = Math.sqrt(gameSize.width * gameSize.height);
            this.cameras.main.setZoom(Math.max(1, Math.round(screenSide / TARGET_VISIBLE_WORLD_SIDE)));
        };
        applyCameraZoom(this.scale.gameSize);
        this.scale.on(Phaser.Scale.Events.RESIZE, applyCameraZoom);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, applyCameraZoom));

        this.performanceOverlay = new PerformanceOverlay(this);
    }

    update(_time: number, deltaMilliseconds: number): void {
        if (this.isSwitchingMap) {
            return;
        }

        const updateStartTimestamp = performance.now();

        const activePointer = this.input.activePointer;
        if (activePointer.isDown) {
            this.setDestinationFromPointer(activePointer);
        }

        const previousPlayerX = this.player.x;
        const previousPlayerY = this.player.y;
        const isMovingLeft = this.cursors.left.isDown || this.wasd.A.isDown;
        const isMovingRight = this.cursors.right.isDown || this.wasd.D.isDown;
        const isMovingUp = this.cursors.up.isDown || this.wasd.W.isDown;
        const isMovingDown = this.cursors.down.isDown || this.wasd.S.isDown;
        this.player.setMoveDirection(
            (isMovingLeft ? -1 : 0) + (isMovingRight ? 1 : 0),
            (isMovingUp ? -1 : 0) + (isMovingDown ? 1 : 0)
        );
        this.player.update(this.level, deltaMilliseconds);

        const movedDistance = Math.hypot(this.player.x - previousPlayerX, this.player.y - previousPlayerY);
        const sampleCount = Math.max(1, Math.ceil(movedDistance / PLAYER_COLLIDER_RADIUS));
        let touchedTrigger: LevelTrigger | undefined;

        for (let sampleIndex = 1; sampleIndex <= sampleCount && !touchedTrigger; sampleIndex++) {
            const progress = sampleIndex / sampleCount;
            const sampleX = previousPlayerX + (this.player.x - previousPlayerX) * progress;
            const sampleY = previousPlayerY + (this.player.y - previousPlayerY) * progress;

            touchedTrigger = this.level.triggers.find((levelTrigger) =>
                circleOverlapsShapes(sampleX, sampleY, PLAYER_COLLIDER_RADIUS, levelTrigger.segments, levelTrigger.circles)
            );
        }

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

    private setDestinationFromPointer(pointer: Phaser.Input.Pointer): void {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.player.moveTo(worldPoint.x, worldPoint.y);
    }
}