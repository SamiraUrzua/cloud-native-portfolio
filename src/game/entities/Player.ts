import Phaser from 'phaser';
import { resolveCircleMovement } from '@/game/world/Collision';
import { Level } from '@/game/world/Level';

const SPEED = 300;
export const PLAYER_COLLIDER_RADIUS = 8;

export class Player extends Phaser.GameObjects.Sprite {
    private readonly debugGraphics: Phaser.GameObjects.Graphics;
    heightLevel = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, '');
        scene.add.existing(this);
        this.setVisible(false);
        this.debugGraphics = scene.add.graphics();
        this.debugGraphics.setDepth(1000);
    }

    update(
        cursors: Phaser.Types.Input.Keyboard.CursorKeys,
        wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key },
        level: Level,
        deltaMilliseconds: number
    ): void {
        const left = cursors.left.isDown || wasd.A.isDown;
        const right = cursors.right.isDown || wasd.D.isDown;
        const up = cursors.up.isDown || wasd.W.isDown;
        const down = cursors.down.isDown || wasd.S.isDown;

        const directionX = (left ? -1 : 0) + (right ? 1 : 0);
        const directionY = (up ? -1 : 0) + (down ? 1 : 0);
        const directionLength = Math.hypot(directionX, directionY) || 1;
        const distance = (SPEED * deltaMilliseconds) / 1000;
        const displacementX = (directionX / directionLength) * distance;
        const displacementY = (directionY / directionLength) * distance;

        const objectColliders = this.heightLevel === 0 ? level.y0Colliders : level.y1Colliders;
        const tileSegments = level.getTileSegments(
            this.heightLevel,
            Math.min(this.x, this.x + displacementX) - PLAYER_COLLIDER_RADIUS,
            Math.min(this.y, this.y + displacementY) - PLAYER_COLLIDER_RADIUS,
            Math.max(this.x, this.x + displacementX) + PLAYER_COLLIDER_RADIUS,
            Math.max(this.y, this.y + displacementY) + PLAYER_COLLIDER_RADIUS
        );

        const resolvedDisplacement = resolveCircleMovement(
            this.x,
            this.y,
            PLAYER_COLLIDER_RADIUS,
            displacementX,
            displacementY,
            objectColliders.segments.concat(tileSegments),
            objectColliders.circles
        );
        this.x += resolvedDisplacement.x;
        this.y += resolvedDisplacement.y;

        this.debugGraphics.clear();
        this.debugGraphics.lineStyle(1, 0x00ff00, 1);
        this.debugGraphics.strokeCircle(this.x, this.y, PLAYER_COLLIDER_RADIUS);
    }
}