import Phaser from 'phaser';
import { BootScene } from '@/game/scenes/BootScene';
import { GameScene } from '@/game/scenes/GameScene';

const TARGET_FRAMES_PER_SECOND = 60;

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
    return {
        type: Phaser.AUTO,
        parent,
        scale: {
            mode: Phaser.Scale.RESIZE,
            width: '100%',
            height: '100%',
        },
        backgroundColor: '#1a1a2e',
        pixelArt: true,
        antialias: true,
        fps: {
            target: TARGET_FRAMES_PER_SECOND,
        },
        scene: [BootScene, GameScene],
    };
}