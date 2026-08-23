import Phaser from 'phaser';
import {
    DETOUR_FORWARD_DISTANCE,
    DETOUR_SEARCH_RADIUS,
    findDetourWaypoint,
    resolveCircleMovement,
    PLAYER_COLLIDER_RADIUS,
} from '@/game/world/Collision';
import { Level } from '@/game/world/Level';

const SPEED = 100;
const SPRITE_SCALE = 0.5;
const MIN_PROGRESS_DISTANCE = 0.001;

const FACING_DIRECTIONS = ['up', 'left', 'down', 'right'];
const WALK_CYCLE_DISTANCE = 80;
const MIN_WALKING_SPEED = SPEED / 10;
const SKIPPED_LEADING_FRAMES: Record<string, number> = { idle: 0, walk: 1 };

export class Player extends Phaser.GameObjects.Sprite {
    heightLevel = 0;
    private facingDirection = 'down';
    private destination: { x: number; y: number } | undefined;
    private detourWaypoint: { x: number; y: number } | undefined;
    private moveDirectionX = 0;
    private moveDirectionY = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player-idle', 0);
        scene.add.existing(this);
        this.setScale(SPRITE_SCALE);
        this.setDisplayOrigin(this.width / 2, this.height - PLAYER_COLLIDER_RADIUS / SPRITE_SCALE + 8);

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
    }

    setMoveDirection(directionX: number, directionY: number): void {
        this.moveDirectionX = directionX;
        this.moveDirectionY = directionY;
        if (directionX !== 0 || directionY !== 0) this.stopMovement();
    }

    moveTo(x: number, y: number): void {
        this.destination = { x, y };
    }

    stopMovement(): void {
        this.destination = undefined;
        this.detourWaypoint = undefined;
    }

    update(level: Level, deltaMilliseconds: number): void {
        this.setDepth(level.getPlayerDepth(this.heightLevel));

        const previousX = this.x;
        const previousY = this.y;
        const target = this.detourWaypoint ?? this.destination;
        const directionX = target ? target.x - this.x : this.moveDirectionX;
        const directionY = target ? target.y - this.y : this.moveDirectionY;
        const directionLength = Math.hypot(directionX, directionY);
        const unitDirectionX = directionX / (directionLength || 1);
        const unitDirectionY = directionY / (directionLength || 1);
        const maxStepDistance = (SPEED * deltaMilliseconds) / 1000;
        const stepDistance = target ? Math.min(maxStepDistance, directionLength) : maxStepDistance;

        const objectColliders = this.heightLevel === 0 ? level.y0Colliders : level.y1Colliders;
        const segments = objectColliders.segments.concat(
            level.getTileSegments(
                this.heightLevel,
                this.x - DETOUR_SEARCH_RADIUS,
                this.y - DETOUR_SEARCH_RADIUS,
                this.x + DETOUR_SEARCH_RADIUS,
                this.y + DETOUR_SEARCH_RADIUS
            )
        );

        const resolvedDisplacement = resolveCircleMovement(
            this.x,
            this.y,
            unitDirectionX * stepDistance,
            unitDirectionY * stepDistance,
            segments,
            objectColliders.circles,
            this.destination !== undefined
        );
        const nextX = this.x + resolvedDisplacement.x;
        const nextY = this.y + resolvedDisplacement.y;
        const distanceAfterMoving = target ? Math.hypot(target.x - nextX, target.y - nextY) : 0;

        if (!target || directionLength - distanceAfterMoving >= MIN_PROGRESS_DISTANCE) {
            this.setPosition(nextX, nextY);
            if (this.detourWaypoint && distanceAfterMoving < MIN_PROGRESS_DISTANCE) {
                this.detourWaypoint = undefined;
            }
        } else {
            this.detourWaypoint =
                !this.detourWaypoint && directionLength > DETOUR_FORWARD_DISTANCE
                    ? findDetourWaypoint(this.x, this.y, unitDirectionX, unitDirectionY, segments, objectColliders.circles)
                    : undefined;
            if (!this.detourWaypoint) this.destination = undefined;
        }

        const movedX = this.x - previousX;
        const movedY = this.y - previousY;
        const isWalking = Math.hypot(movedX, movedY) / (deltaMilliseconds / 1000) > MIN_WALKING_SPEED;
        const isUsingKeyboard = this.moveDirectionX !== 0 || this.moveDirectionY !== 0;
        if (isUsingKeyboard || isWalking) {
            const facingX = isUsingKeyboard ? this.moveDirectionX : movedX;
            const facingY = isUsingKeyboard ? this.moveDirectionY : movedY;
            const isFacingVertically = Math.abs(facingY) > Math.abs(facingX) * 1.1;
            this.facingDirection = isFacingVertically ? (facingY < 0 ? 'up' : 'down') : facingX < 0 ? 'left' : 'right';
        }
        this.play(`player-${isWalking ? 'walk' : 'idle'}-${this.facingDirection}`, true);
        this.anims.timeScale = isWalking ? SPEED / WALK_CYCLE_DISTANCE : 1;
    }
}