import Phaser from 'phaser';
import { resolveCircleMovement } from '@/game/world/Collision';
import { Circle, Segment } from '@/game/world/TiledShapes';

const SPEED = 300;
export const PLAYER_COLLIDER_RADIUS = 8;

export class Player extends Phaser.GameObjects.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    private debugGraphics!: Phaser.GameObjects.Graphics;
    heightLevel = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, '');
        scene.add.existing(this);
        this.setVisible(false);
    }

    enablePhysics(): void {
        this.scene.physics.add.existing(this);
        this.body.setCircle(
            PLAYER_COLLIDER_RADIUS,
            (this.width - PLAYER_COLLIDER_RADIUS * 2) / 2,
            (this.height - PLAYER_COLLIDER_RADIUS * 2) / 2
        );
        this.debugGraphics = this.scene.add.graphics();
        this.debugGraphics.setDepth(1000);
    }

    update(
        cursors: Phaser.Types.Input.Keyboard.CursorKeys,
        wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key },
        colliderSegments: Segment[],
        colliderCircles: Circle[]
    ): void {
        if (!this.body) return;

        this.debugGraphics.clear();
        this.debugGraphics.lineStyle(1, 0x00ff00, 1);
        this.debugGraphics.strokeCircle(this.body.center.x, this.body.center.y, PLAYER_COLLIDER_RADIUS);

        const left = cursors.left.isDown || wasd.A.isDown;
        const right = cursors.right.isDown || wasd.D.isDown;
        const up = cursors.up.isDown || wasd.W.isDown;
        const down = cursors.down.isDown || wasd.S.isDown;

        const vx = (left ? -1 : 0) + (right ? 1 : 0);
        const vy = (up ? -1 : 0) + (down ? 1 : 0);

        this.body.setVelocity(vx, vy);
        if (vx !== 0 || vy !== 0) {
            this.body.velocity.normalize().scale(SPEED);
        }

        const fixedTimeStep = 1 / this.scene.physics.world.fps;
        const resolvedDisplacement = resolveCircleMovement(
            this.body.center.x,
            this.body.center.y,
            PLAYER_COLLIDER_RADIUS,
            this.body.velocity.x * fixedTimeStep,
            this.body.velocity.y * fixedTimeStep,
            colliderSegments,
            colliderCircles
        );
        this.body.setVelocity(resolvedDisplacement.x / fixedTimeStep, resolvedDisplacement.y / fixedTimeStep);
    }
}