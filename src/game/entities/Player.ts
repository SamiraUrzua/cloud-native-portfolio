import Phaser from 'phaser';
import {
    MAX_DETOUR_DISTANCE,
    DETOUR_SEARCH_RADIUS,
    isForwardPathClear,
    resolveCircleMovement,
    PLAYER_COLLIDER_RADIUS,
} from '@/game/world/Collision';
import { Level } from '@/game/world/Level';

const SPEED = 100;
const SPRITE_SCALE = 0.5;
const MIN_PROGRESS_DISTANCE = 0.001;
const MIN_DETOUR_ALIGNMENT = 0;
const DETOUR_PROBE_STEP_DISTANCE = PLAYER_COLLIDER_RADIUS;

const FACING_DIRECTIONS = ['up', 'left', 'down', 'right'];
const WALK_CYCLE_DISTANCE = 80;
const MIN_WALKING_SPEED = SPEED / 10;
const SKIPPED_LEADING_FRAMES: Record<string, number> = { idle: 0, walk: 1 };

interface Detour {
    side: number;
    startDirectionX: number;
    startDirectionY: number;
    travelledDistance: number;
}

export class Player extends Phaser.GameObjects.Sprite {
    heightLevel = 0;
    private facingDirection = 'down';
    private destination: { x: number; y: number } | undefined;
    private detour: Detour | undefined;
    private unreachableDestination: { x: number; y: number } | undefined;
    private lastDetourSide = 1;
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
        this.detour = undefined;
        this.unreachableDestination = undefined;
        this.lastDetourSide = 1;
    }

    update(level: Level, deltaMilliseconds: number): void {
        this.setDepth(level.getPlayerDepth(this.heightLevel));

        const previousX = this.x;
        const previousY = this.y;
        const destination = this.destination;
        const directionX = destination ? destination.x - this.x : this.moveDirectionX;
        const directionY = destination ? destination.y - this.y : this.moveDirectionY;
        const directionLength = Math.hypot(directionX, directionY);
        const unitDirectionX = directionX / (directionLength || 1);
        const unitDirectionY = directionY / (directionLength || 1);
        const maxStepDistance = (SPEED * deltaMilliseconds) / 1000;

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

        if (this.detour) {
            const alignmentWithDetourStart =
                unitDirectionX * this.detour.startDirectionX + unitDirectionY * this.detour.startDirectionY;
            const hasClearPathToDestination = isForwardPathClear(
                this.x,
                this.y,
                unitDirectionX,
                unitDirectionY,
                segments,
                objectColliders.circles
            );
            if (!destination || alignmentWithDetourStart < MIN_DETOUR_ALIGNMENT || hasClearPathToDestination) {
                this.detour = undefined;
            }
        }

        const detour = this.detour;
        const travelDirectionX = detour ? -unitDirectionY * detour.side : unitDirectionX;
        const travelDirectionY = detour ? unitDirectionX * detour.side : unitDirectionY;
        const stepDistance = destination && !detour ? Math.min(maxStepDistance, directionLength) : maxStepDistance;

        const resolvedDisplacement = resolveCircleMovement(
            this.x,
            this.y,
            travelDirectionX * stepDistance,
            travelDirectionY * stepDistance,
            segments,
            objectColliders.circles,
            destination !== undefined
        );
        const resolvedDistance = Math.hypot(resolvedDisplacement.x, resolvedDisplacement.y);
        const nextX = this.x + resolvedDisplacement.x;
        const nextY = this.y + resolvedDisplacement.y;
        const distanceAfterMoving = destination ? Math.hypot(destination.x - nextX, destination.y - nextY) : 0;

        if (detour) {
            if (detour.travelledDistance < MAX_DETOUR_DISTANCE && resolvedDistance >= MIN_PROGRESS_DISTANCE) {
                this.setPosition(nextX, nextY);
                detour.travelledDistance += resolvedDistance;
            } else {
                this.detour = undefined;
                this.unreachableDestination = { x: destination!.x, y: destination!.y };
            }
        } else if (!destination || directionLength - distanceAfterMoving >= MIN_PROGRESS_DISTANCE) {
            this.setPosition(nextX, nextY);
        } else if (
            this.unreachableDestination?.x !== destination.x ||
            this.unreachableDestination?.y !== destination.y
        ) {
            const viableDetourSide = [this.lastDetourSide, -this.lastDetourSide].find((candidateSide) => {
                let probeX = this.x;
                let probeY = this.y;
                let probeTravelledDistance = 0;

                while (probeTravelledDistance < MAX_DETOUR_DISTANCE) {
                    const probeDirectionLength = Math.hypot(destination.x - probeX, destination.y - probeY) || 1;
                    const probeDirectionX = (destination.x - probeX) / probeDirectionLength;
                    const probeDirectionY = (destination.y - probeY) / probeDirectionLength;
                    const probeDisplacement = resolveCircleMovement(
                        probeX,
                        probeY,
                        -probeDirectionY * candidateSide * DETOUR_PROBE_STEP_DISTANCE,
                        probeDirectionX * candidateSide * DETOUR_PROBE_STEP_DISTANCE,
                        segments,
                        objectColliders.circles,
                        true
                    );
                    const probeDistance = Math.hypot(probeDisplacement.x, probeDisplacement.y);
                    if (probeDistance < MIN_PROGRESS_DISTANCE) return false;

                    probeX += probeDisplacement.x;
                    probeY += probeDisplacement.y;
                    probeTravelledDistance += probeDistance;

                    const nextProbeDirectionLength = Math.hypot(destination.x - probeX, destination.y - probeY) || 1;
                    if (
                        isForwardPathClear(
                            probeX,
                            probeY,
                            (destination.x - probeX) / nextProbeDirectionLength,
                            (destination.y - probeY) / nextProbeDirectionLength,
                            segments,
                            objectColliders.circles
                        )
                    ) {
                        return true;
                    }
                }

                return false;
            });

            if (viableDetourSide === undefined) {
                this.unreachableDestination = { x: destination.x, y: destination.y };
            } else {
                this.lastDetourSide = viableDetourSide;
                this.detour = {
                    side: viableDetourSide,
                    startDirectionX: unitDirectionX,
                    startDirectionY: unitDirectionY,
                    travelledDistance: 0,
                };
            }
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