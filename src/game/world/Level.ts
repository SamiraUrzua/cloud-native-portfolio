import Phaser from 'phaser';
import { Circle, drawShapeLayer, objectLayerToCircles, objectLayerToSegments, rectangleToSegments, Segment, tiledObjectToCircle, tiledObjectToSegments } from '@/game/world/TiledShapes';

export type LevelTriggerAction =
    | { type: 'heightLevel'; targetHeightLevel: number }
    | { type: 'map'; targetMapKey: string; targetSpawnName: string };

export interface LevelTrigger {
    segments: Segment[];
    circles: Circle[];
    action: LevelTriggerAction;
}

export interface ColliderSet {
    segments: Segment[];
    circles: Circle[];
}

export interface SpawnPoint {
    x: number;
    y: number;
    heightLevel: number;
}

interface RawTiledLayerJSON {
    name: string;
    type: string;
    color?: string;
}

const DEBUG_LAYERS: Record<string, boolean> = {
    "FloorCollider": true,
    "Y1Colliders": true,
    "Triggers": true,
    "Colliders": true,
    "Y0Colliders": true,
    "Players-NPC": true,
};

export class Level {
    readonly widthInPixels: number;
    readonly heightInPixels: number;
    readonly spawnPoints = new Map<string, SpawnPoint>();
    readonly triggers: LevelTrigger[] = [];
    readonly y0Colliders: ColliderSet;
    readonly y1Colliders: ColliderSet;
    playerDepth = 0;
    private readonly widthInTiles: number;
    private readonly heightInTiles: number;
    private readonly tileWidthInPixels: number;
    private readonly tileHeightInPixels: number;
    private readonly solidTiles: Uint8Array;

    constructor(scene: Phaser.Scene, mapKey: string) {
        const map = scene.make.tilemap({ key: mapKey });

        const tilesets = map.tilesets.map((tileset) =>
            map.addTilesetImage(
                tileset.name,
                tileset.name,
                tileset.tileWidth,
                tileset.tileHeight,
                tileset.tileMargin,
                tileset.tileSpacing
            )
        ) as Phaser.Tilemaps.Tileset[];

        const rawTiledLayers = (scene.cache.tilemap.get(mapKey).data as { layers: RawTiledLayerJSON[] }).layers;
        const tileLayers: Phaser.Tilemaps.TilemapLayer[] = [];
        const globalColliderSegments: Segment[] = [];
        const globalColliderCircles: Circle[] = [];
        const y0ColliderSegments: Segment[] = [];
        const y0ColliderCircles: Circle[] = [];
        const y1ColliderSegments: Segment[] = [];
        const y1ColliderCircles: Circle[] = [];

        rawTiledLayers.forEach((rawLayer, layerIndex) => {
            if (rawLayer.type === 'tilelayer') {
                const tileLayer = map.createLayer(rawLayer.name, tilesets) as Phaser.Tilemaps.TilemapLayer | null;
                if (!tileLayer) {
                    throw new Error(`Level: failed to create tile layer "${rawLayer.name}" in map "${mapKey}"`);
                }
                tileLayer.setDepth(layerIndex);
                tileLayer.setVisible(DEBUG_LAYERS[rawLayer.name] ?? true);
                tileLayers.push(tileLayer);
                return;
            }

            if (rawLayer.type !== 'objectgroup') {
                return;
            }

            const layerName = rawLayer.name;
            const objectLayer = map.getObjectLayer(layerName);
            if (!objectLayer) {
                throw new Error(`Level: failed to find object layer "${layerName}" in map "${mapKey}"`);
            }
            const objects = objectLayer.objects;

            if (layerName === 'Colliders') {
                globalColliderSegments.push(...objectLayerToSegments(0, 0, objects));
                globalColliderCircles.push(...objectLayerToCircles(0, 0, objects));
            } else if (layerName === 'Y0Colliders') {
                y0ColliderSegments.push(...objectLayerToSegments(0, 0, objects));
                y0ColliderCircles.push(...objectLayerToCircles(0, 0, objects));
            } else if (layerName === 'Y1Colliders') {
                y1ColliderSegments.push(...objectLayerToSegments(0, 0, objects));
                y1ColliderCircles.push(...objectLayerToCircles(0, 0, objects));
            } else if (layerName === 'Players-NPC') {
                this.playerDepth = layerIndex;
                objects.forEach((spawnObject) => {
                    if (!spawnObject.point || spawnObject.x === undefined || spawnObject.y === undefined) return;

                    const properties = (spawnObject.properties ?? []) as { name: string; value: unknown }[];
                    const heightLevel = properties.find((property) => property.name === 'heightlevel')?.value;
                    this.spawnPoints.set(spawnObject.name, {
                        x: spawnObject.x,
                        y: spawnObject.y,
                        heightLevel: typeof heightLevel === 'number' ? heightLevel : 0,
                    });
                });
            } else if (layerName === 'Triggers') {
                objects.forEach((triggerObject) => {
                    const properties = (triggerObject.properties ?? []) as { name: string; value: unknown }[];
                    const targetHeightLevel = properties.find((property) => property.name === 'targetlevel')?.value;
                    const targetMapKey = properties.find((property) => property.name === 'targetmap')?.value;
                    const targetSpawnName = properties.find((property) => property.name === 'targetspawn')?.value;

                    const action: LevelTriggerAction | undefined =
                        typeof targetMapKey === 'string' && typeof targetSpawnName === 'string'
                            ? { type: 'map', targetMapKey, targetSpawnName }
                            : typeof targetHeightLevel === 'number'
                              ? { type: 'heightLevel', targetHeightLevel }
                              : undefined;
                    if (!action) return;

                    const triggerCircle = tiledObjectToCircle(0, 0, triggerObject);
                    this.triggers.push({
                        segments: tiledObjectToSegments(0, 0, triggerObject),
                        circles: triggerCircle ? [triggerCircle] : [],
                        action,
                    });
                });
            }

            const gidsOnLayer = [...new Set(
                objects
                    .filter((obj) => obj.gid !== undefined)
                    .map((obj) => obj.gid as number)
            )];

            gidsOnLayer.forEach((gid) => {
                const spritesForGid = map.createFromObjects(layerName, { gid });
                spritesForGid.forEach((sprite) => (sprite as Phaser.GameObjects.Sprite).setDepth(layerIndex));
            });

            if (DEBUG_LAYERS[layerName] && objects.length > 0) {
                const shapeGraphics = scene.add.graphics();
                shapeGraphics.setDepth(layerIndex);
                drawShapeLayer(shapeGraphics, {
                    x: 0,
                    y: 0,
                    color: rawLayer.color,
                    objects,
                });
            }
        });

        this.y0Colliders = {
            segments: [...globalColliderSegments, ...y0ColliderSegments],
            circles: [...globalColliderCircles, ...y0ColliderCircles],
        };
        this.y1Colliders = {
            segments: [...globalColliderSegments, ...y1ColliderSegments],
            circles: [...globalColliderCircles, ...y1ColliderCircles],
        };
        this.widthInPixels = map.widthInPixels;
        this.heightInPixels = map.heightInPixels;
        this.widthInTiles = map.width;
        this.heightInTiles = map.height;
        this.tileWidthInPixels = map.tileWidth;
        this.tileHeightInPixels = map.tileHeight;
        this.solidTiles = new Uint8Array(map.width * map.height);

        for (let tileY = 0; tileY < map.height; tileY++) {
            for (let tileX = 0; tileX < map.width; tileX++) {
                let anyLayerWantsCollider = false;
                let anyLayerForbidsCollider = false;

                for (const tileLayer of tileLayers) {
                    const tile = tileLayer.getTileAt(tileX, tileY);
                    if (!tile) continue;

                    const colliderProperty = tile.properties.collider;
                    if (colliderProperty === true) {
                        anyLayerWantsCollider = true;
                    } else if (colliderProperty === false) {
                        anyLayerForbidsCollider = true;
                    }
                }

                if (anyLayerWantsCollider && !anyLayerForbidsCollider) {
                    this.solidTiles[tileY * map.width + tileX] = 1;
                }
            }
        }
    }

    getTileSegments(heightLevel: number, minX: number, minY: number, maxX: number, maxY: number): Segment[] {
        if (heightLevel !== 0) return [];

        const segments: Segment[] = [];
        const firstTileX = Math.floor(minX / this.tileWidthInPixels);
        const lastTileX = Math.floor(maxX / this.tileWidthInPixels);
        const firstTileY = Math.floor(minY / this.tileHeightInPixels);
        const lastTileY = Math.floor(maxY / this.tileHeightInPixels);

        for (let tileY = firstTileY; tileY <= lastTileY; tileY++) {
            for (let tileX = firstTileX; tileX <= lastTileX; tileX++) {
                const isInsideMap = tileX >= 0 && tileX < this.widthInTiles && tileY >= 0 && tileY < this.heightInTiles;
                if (isInsideMap && this.solidTiles[tileY * this.widthInTiles + tileX] === 0) continue;

                segments.push(
                    ...rectangleToSegments(
                        tileX * this.tileWidthInPixels,
                        tileY * this.tileHeightInPixels,
                        this.tileWidthInPixels,
                        this.tileHeightInPixels
                    )
                );
            }
        }

        return segments;
    }
}