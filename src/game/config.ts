import Phaser from 'phaser';
import { BootScene } from '@/game/scenes/BootScene';
import { GameScene } from '@/game/scenes/GameScene';

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
        scene: [BootScene, GameScene],
    };
}