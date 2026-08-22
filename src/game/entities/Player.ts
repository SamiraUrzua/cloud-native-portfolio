import Phaser from 'phaser';
import { findDetourWaypoint, resolveCircleMovement } from '@/game/world/Collision';
import { Level } from '@/game/world/Level';

const SPEED = 300;
export const PLAYER_COLLIDER_RADIUS = 8-0.1;
const MIN_PROGRESS_DISTANCE = 0.001;
const MAX_DETOUR_DISTANCE = 64;
const DETOUR_FORWARD_DISTANCE = PLAYER_COLLIDER_RADIUS * 2;
const DETOUR_SEARCH_RADIUS = PLAYER_COLLIDER_RADIUS + MAX_DETOUR_DISTANCE + DETOUR_FORWARD_DISTANCE;

const FACING_DIRECTIONS = ['up', 'left', 'down', 'right'];
const WALK_CYCLE_DISTANCE = 80;
const MIN_WALKING_SPEED = SPEED / 10;
const SKIPPED_LEADING_FRAMES: Record<string, number> = { idle: 0, walk: 1 };

export class Player extends Phaser.GameObjects.Sprite {
    private readonly debugGraphics: Phaser.GameObjects.Graphics;
    heightLevel = 0;
    private facingDirection = 'down';
    private destination: { x: number; y: number } | undefined;
    private detourWaypoint: { x: number; y: number } | undefined;
    private moveDirectionX = 0;
    private moveDirectionY = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player-idle', 0);
        scene.add.existing(this);
        const SPRITE_SCALE = 0.5;
        this.setScale(SPRITE_SCALE);
        this.setDisplayOrigin(
            this.width / 2,
            this.height - PLAYER_COLLIDER_RADIUS / SPRITE_SCALE + 8
        );

        Object.entries(SKIPPED_LEADING_FRAMES).forEach(([animationName, skippedLeadingFrames]) => {
            const textureKey = `player-${animationName}`;
            const framesPerRow = (scene.textures.get(textureKey).frameTotal - 1) / FACING_DIRECTIONS.length;
            FACING_DIRECTIONS.forEach((direction, rowIndex) => {
                const animationKey = `${textureKey}-${direction}`;
                if (scene.anims.exists(animationKey)) return;
                scene.anims.create({
                    key: animationKey,
                    frames: scene.anims.generateFrameNumbers(textureKey, {
                        start: rowIndex * framesPerRow + skippedLeadingFrames,
                        end: rowIndex * framesPerRow + framesPerRow - 1,
                    }),
                    frameRate: framesPerRow - skippedLeadingFrames,
                    repeat: -1,
                });
            });
        });

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
        const previousX = this.x;
        const previousY = this.y;
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

        const movedX = this.x - previousX;
        const movedY = this.y - previousY;
        const isWalking = Math.hypot(movedX, movedY) / (deltaMilliseconds / 1000) > MIN_WALKING_SPEED;
        const isUsingKeyboard = this.moveDirectionX !== 0 || this.moveDirectionY !== 0;
        if (isUsingKeyboard || isWalking) {
            const facingX = isUsingKeyboard ? this.moveDirectionX : movedX;
            const facingY = isUsingKeyboard ? this.moveDirectionY : movedY;
            this.facingDirection =
                Math.abs(facingY) > Math.abs(facingX) * 1.1
                    ? facingY < 0
                        ? 'up'
                        : 'down'
                    : facingX < 0
                      ? 'left'
                      : 'right';
        }
        this.play(`player-${isWalking ? 'walk' : 'idle'}-${this.facingDirection}`, true);
        this.anims.timeScale = isWalking ? SPEED / WALK_CYCLE_DISTANCE : 1;

        this.debugGraphics.clear();
        this.debugGraphics.lineStyle(1, 0x00ff00, 1);
        this.debugGraphics.strokeCircle(this.x, this.y, PLAYER_COLLIDER_RADIUS);
    }
}