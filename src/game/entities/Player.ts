import Phaser from 'phaser';
import { findDetourWaypoint, resolveCircleMovement } from '@/game/world/Collision';
import { Level } from '@/game/world/Level';

const SPEED = 300;
export const PLAYER_COLLIDER_RADIUS = 8;
const MIN_PROGRESS_DISTANCE = 0.001;
const MAX_DETOUR_DISTANCE = 64;
const DETOUR_FORWARD_DISTANCE = PLAYER_COLLIDER_RADIUS * 2;
const DETOUR_SEARCH_RADIUS = PLAYER_COLLIDER_RADIUS + MAX_DETOUR_DISTANCE + DETOUR_FORWARD_DISTANCE;

export class Player extends Phaser.GameObjects.Sprite {
    private readonly debugGraphics: Phaser.GameObjects.Graphics;
    heightLevel = 0;
    private destination: { x: number; y: number } | undefined;
    private detourWaypoint: { x: number; y: number } | undefined;
    private moveDirectionX = 0;
    private moveDirectionY = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, '');
        scene.add.existing(this);
        this.setVisible(false);
        this.debugGraphics = scene.add.graphics();
        this.debugGraphics.setDepth(1000);
    }

    setMoveDirection(directionX: number, directionY: number): void {
        this.moveDirectionX = directionX;
        this.moveDirectionY = directionY;
        if (directionX !== 0 || directionY !== 0) {
            this.destination = undefined;
            this.detourWaypoint = undefined;
        }
    }

    moveTo(x: number, y: number): void {
        this.destination = { x, y };
    }

    stopMovement(): void {
        this.destination = undefined;
        this.detourWaypoint = undefined;
        this.moveDirectionX = 0;
        this.moveDirectionY = 0;
    }

    update(level: Level, deltaMilliseconds: number): void {
        const target = this.detourWaypoint ?? this.destination;
        let directionX = this.moveDirectionX;
        let directionY = this.moveDirectionY;
        let distanceToTarget = Infinity;
        if (target) {
            directionX = target.x - this.x;
            directionY = target.y - this.y;
            distanceToTarget = Math.hypot(directionX, directionY);
        }

        const directionLength = Math.hypot(directionX, directionY) || 1;
        const distance = Math.min((SPEED * deltaMilliseconds) / 1000, distanceToTarget);
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
            objectColliders.circles,
            this.destination !== undefined
        );
        const nextX = this.x + resolvedDisplacement.x;
        const nextY = this.y + resolvedDisplacement.y;
        const distanceAfterMoving = target ? Math.hypot(target.x - nextX, target.y - nextY) : 0;

        if (distanceToTarget - distanceAfterMoving >= MIN_PROGRESS_DISTANCE) {
            this.x = nextX;
            this.y = nextY;
            if (this.detourWaypoint && distanceAfterMoving < MIN_PROGRESS_DISTANCE) {
                this.detourWaypoint = undefined;
            }
        } else if (!this.detourWaypoint && distanceToTarget > DETOUR_FORWARD_DISTANCE) {
            const detourTileSegments = level.getTileSegments(
                this.heightLevel,
                this.x - DETOUR_SEARCH_RADIUS,
                this.y - DETOUR_SEARCH_RADIUS,
                this.x + DETOUR_SEARCH_RADIUS,
                this.y + DETOUR_SEARCH_RADIUS
            );
            this.detourWaypoint = findDetourWaypoint(
                this.x,
                this.y,
                PLAYER_COLLIDER_RADIUS,
                directionX / directionLength,
                directionY / directionLength,
                objectColliders.segments.concat(detourTileSegments),
                objectColliders.circles,
                MAX_DETOUR_DISTANCE,
                DETOUR_FORWARD_DISTANCE
            );
            if (!this.detourWaypoint) {
                this.destination = undefined;
            }
        } else {
            this.destination = undefined;
            this.detourWaypoint = undefined;
        }

        this.debugGraphics.clear();
        this.debugGraphics.lineStyle(1, 0x00ff00, 1);
        this.debugGraphics.strokeCircle(this.x, this.y, PLAYER_COLLIDER_RADIUS);
    }
}