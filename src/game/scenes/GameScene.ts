import Phaser from 'phaser';
import { Player, PLAYER_COLLIDER_RADIUS } from '@/game/entities/Player';
import { PerformanceOverlay } from '@/game/utils/PerformanceOverlay';
import { circleOverlapsShapes } from '@/game/world/Collision';
import { Level } from '@/game/world/Level';

const CAMERA_ZOOM = 4;
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
        this.player.enablePhysics();
        this.level.collideWith(this.player);
        this.level.setTileCollisionsEnabled(this.player.heightLevel === 0);

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as typeof this.wasd;

        this.cameras.main.setBounds(0, 0, this.level.widthInPixels, this.level.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(CAMERA_ZOOM);
        this.cameras.main.fadeIn(MAP_FADE_DURATION_MS);

        this.performanceOverlay = new PerformanceOverlay(this);
    }

    update(): void {
        if (this.isSwitchingMap) {
            this.player.body.setVelocity(0, 0);
            return;
        }

        const updateStartTimestamp = performance.now();

        const activeColliders = this.player.heightLevel === 0 ? this.level.y0Colliders : this.level.y1Colliders;
        this.player.update(this.cursors, this.wasd, activeColliders.segments, activeColliders.circles);

        const touchedTrigger = this.level.triggers.find((levelTrigger) =>
            circleOverlapsShapes(
                this.player.body.center.x,
                this.player.body.center.y,
                PLAYER_COLLIDER_RADIUS,
                levelTrigger.segments,
                levelTrigger.circles
            )
        );

        if (touchedTrigger) {
            const action = touchedTrigger.action;
            if (action.type === 'heightLevel') {
                this.player.heightLevel = action.targetHeightLevel;
                this.level.setTileCollisionsEnabled(this.player.heightLevel === 0);
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