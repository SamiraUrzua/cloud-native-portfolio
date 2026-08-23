import Phaser from 'phaser';

const START_MAP_KEY = 'world';
const MAP_KEYS = [START_MAP_KEY];
const PLAYER_ANIMATION_NAMES = ['idle', 'walk'];
const PLAYER_FRAME_SIZE = 64;

interface TiledMapJSON {
    tilesets: {
        name: string;
        image: string;
        tilewidth: number;
        tileheight: number;
        margin: number;
        spacing: number;
    }[];
}

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload(): void {
        PLAYER_ANIMATION_NAMES.forEach((animationName) => {
            this.load.spritesheet(`player-${animationName}`, `/game-assets/characters/main/${animationName}.png`, {
                frameWidth: PLAYER_FRAME_SIZE,
                frameHeight: PLAYER_FRAME_SIZE,
            });
        });

        MAP_KEYS.forEach((mapKey) => {
            const mapPath = `/game-assets/levels/${mapKey}.json`;
            this.load.tilemapTiledJSON(mapKey, mapPath);

            this.load.once(`filecomplete-tilemapJSON-${mapKey}`, (_key: string, _type: string, data: TiledMapJSON) => {
                data.tilesets.forEach((tileset) => {
                    this.load.spritesheet(tileset.name, new URL(tileset.image, window.location.origin + mapPath).pathname, {
                        frameWidth: tileset.tilewidth,
                        frameHeight: tileset.tileheight,
                        margin: tileset.margin,
                        spacing: tileset.spacing,
                    });
                });
            });
        });
    }

    create(): void {
        this.scene.start('GameScene', { mapKey: START_MAP_KEY });
    }
}