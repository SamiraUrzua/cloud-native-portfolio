import Phaser from 'phaser';

const MAP_DEFINITIONS = [
    { key: 'world', path: '/game-assets/levels/world.json' },
];
const START_MAP_KEY = 'world';
const PLAYER_SPRITESHEETS = [
    { key: 'player-idle', path: '/game-assets/characters/main/idle.png' },
    { key: 'player-walk', path: '/game-assets/characters/main/walk.png' },
];
const PLAYER_FRAME_SIZE = 64;

interface TiledTilesetJSON {
    name: string;
    image: string;
    tilewidth: number;
    tileheight: number;
    margin: number;
    spacing: number;
}

interface TiledMapJSON {
    tilesets: TiledTilesetJSON[];
}

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload(): void {
        const queuedTilesetNames = new Set<string>();

        PLAYER_SPRITESHEETS.forEach((playerSpritesheet) => {
            this.load.spritesheet(playerSpritesheet.key, playerSpritesheet.path, {
                frameWidth: PLAYER_FRAME_SIZE,
                frameHeight: PLAYER_FRAME_SIZE,
            });
        });

        MAP_DEFINITIONS.forEach((mapDefinition) => {
            this.load.tilemapTiledJSON(mapDefinition.key, mapDefinition.path);

            this.load.once(
                `filecomplete-tilemapJSON-${mapDefinition.key}`,
                (_key: string, _type: string, data: TiledMapJSON) => {
                    data.tilesets.forEach((tileset) => {
                        if (queuedTilesetNames.has(tileset.name)) return;
                        queuedTilesetNames.add(tileset.name);

                        const mapUrl = new URL(mapDefinition.path, window.location.origin);
                        const imagePath = new URL(tileset.image, mapUrl).pathname;
                        this.load.spritesheet(tileset.name, imagePath, {
                            frameWidth: tileset.tilewidth,
                            frameHeight: tileset.tileheight,
                            margin: tileset.margin,
                            spacing: tileset.spacing,
                        });
                    });
                }
            );
        });

        this.load.on('loaderror', (file: Phaser.Loader.File) => {
            console.error(`BootScene: failed to load "${file.key}" from ${file.src}`);
        });
    }

    create(): void {
        this.scene.start('GameScene', { mapKey: START_MAP_KEY });
    }
}