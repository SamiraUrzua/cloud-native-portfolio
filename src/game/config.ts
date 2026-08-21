import Phaser from 'phaser';
import { BootScene } from '@/game/scenes/BootScene';
import { GameScene } from '@/game/scenes/GameScene';

export const GAME_WIDTH = 1600;
export const GAME_HEIGHT = 800;
const TARGET_FRAMES_PER_SECOND = 60;

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
    return {
        type: Phaser.AUTO,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        parent,
        backgroundColor: '#1a1a2e',
        pixelArt: true,
        antialias: true,
        fps: {
            target: TARGET_FRAMES_PER_SECOND,
            forceSetTimeOut: true,
        },
        scene: [BootScene, GameScene],
    };
}