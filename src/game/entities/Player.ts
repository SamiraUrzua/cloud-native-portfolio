import Phaser from 'phaser';
import { resolveCircleMovement, PLAYER_COLLIDER_RADIUS } from '@/game/world/Collision';
import { Level } from '@/game/world/Level';

const SPEED = 100;
const SPRITE_SCALE = 0.5;

const FACING_DIRECTIONS = ['up', 'left', 'down', 'right'];
const WALK_CYCLE_DISTANCE = 80;
const MIN_WALKING_SPEED = SPEED / 10;
const WALKING_GRACE_MILLISECONDS = 150;
const FACING_CHANGE_DELAY_MILLISECONDS = 50;
const SKIPPED_LEADING_FRAMES: Record<string, number> = { idle: 0, walk: 1 };

export class Player extends Phaser.GameObjects.Sprite {
    heightLevel = 0;
    private facingDirection = 'down';
    private pendingFacingDirection = 'down';
    private facingChangeElapsedMilliseconds = 0;
    private destination: { x: number; y: number } | undefined;
    private moveDirectionX = 0;
    private moveDirectionY = 0;
    private walkingGraceRemainingMilliseconds = 0;

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
    }

    update(level: Level, deltaMilliseconds: number): void {
        this.setDepth(level.getPlayerDepth(this.heightLevel));

        const isUsingKeyboard = this.moveDirectionX !== 0 || this.moveDirectionY !== 0;
        const directionX = this.destination ? this.destination.x - this.x : this.moveDirectionX;
        const directionY = this.destination ? this.destination.y - this.y : this.moveDirectionY;
        const directionLength = Math.hypot(directionX, directionY);
        const stepDistance = (SPEED * deltaMilliseconds) / 1000;
        const searchRadius = stepDistance + PLAYER_COLLIDER_RADIUS;

        const objectColliders = this.heightLevel === 0 ? level.y0Colliders : level.y1Colliders;
        const segments = objectColliders.segments.concat(
            level.getTileSegments(
                this.heightLevel,
                this.x - searchRadius,
                this.y - searchRadius,
                this.x + searchRadius,
                this.y + searchRadius,
            ),
        );

        const resolvedDisplacement = resolveCircleMovement(
            this.x,
            this.y,
            (directionX / (directionLength || 1)) * stepDistance,
            (directionY / (directionLength || 1)) * stepDistance,
            segments,
            objectColliders.circles,
            this.destination !== undefined,
        );
        this.setPosition(this.x + resolvedDisplacement.x, this.y + resolvedDisplacement.y);

        const actualSpeed = Math.hypot(resolvedDisplacement.x, resolvedDisplacement.y) / (deltaMilliseconds / 1000);
        const isWalking = actualSpeed > MIN_WALKING_SPEED;

        if (isUsingKeyboard || isWalking) {
            const facingX = isUsingKeyboard ? this.moveDirectionX : resolvedDisplacement.x;
            const facingY = isUsingKeyboard ? this.moveDirectionY : resolvedDisplacement.y;
            const desiredFacingDirection =
                Math.abs(facingY) > Math.abs(facingX) * 1.1
                    ? facingY < 0
                        ? 'up'
                        : 'down'
                    : facingX < 0
                      ? 'left'
                      : 'right';
            if (desiredFacingDirection !== this.pendingFacingDirection) {
                this.pendingFacingDirection = desiredFacingDirection;
                this.facingChangeElapsedMilliseconds = 0;
            }
            this.facingChangeElapsedMilliseconds += deltaMilliseconds;
            if (this.facingChangeElapsedMilliseconds >= FACING_CHANGE_DELAY_MILLISECONDS) {
                this.facingDirection = this.pendingFacingDirection;
            }
        }

        this.walkingGraceRemainingMilliseconds = isWalking
            ? WALKING_GRACE_MILLISECONDS
            : Math.max(0, this.walkingGraceRemainingMilliseconds - deltaMilliseconds);
        const showsWalkingAnimation = this.walkingGraceRemainingMilliseconds > 0;
        this.play(`player-${showsWalkingAnimation ? 'walk' : 'idle'}-${this.facingDirection}`, true);
        this.anims.timeScale = showsWalkingAnimation ? Math.max(actualSpeed, MIN_WALKING_SPEED) / WALK_CYCLE_DISTANCE : 1;
    }
}