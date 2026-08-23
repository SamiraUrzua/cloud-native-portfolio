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

export const DEBUG_DRAW_LAYERS: Record<string, boolean> = {
    "Y1Colliders": true,
    "Triggers": true,
    "Colliders": true,
    "Y0Colliders": true,
    "Players-NPC": true,
    "PlayerCollider": true,
};

const DEPTH_OFFSET_BETWEEN_LAYERS = 0.5;

function getTiledProperty(tiledObject: Phaser.Types.Tilemaps.TiledObject, propertyName: string): unknown {
    return (tiledObject.properties as { name: string; value: unknown }[] | undefined)?.find(
        (property) => property.name === propertyName
    )?.value;
}

export class Level {
    readonly widthInPixels: number;
    readonly heightInPixels: number;
    readonly spawnPoints = new Map<string, SpawnPoint>();
    readonly triggers: LevelTrigger[] = [];
    readonly y0Colliders: ColliderSet = { segments: [], circles: [] };
    readonly y1Colliders: ColliderSet = { segments: [], circles: [] };
    private readonly layerIndexByName = new Map<string, number>();
    private readonly map: Phaser.Tilemaps.Tilemap;
    private readonly solidTiles: Uint8Array;

    constructor(scene: Phaser.Scene, mapKey: string) {
        const map = scene.make.tilemap({ key: mapKey });
        this.map = map;
        this.widthInPixels = map.widthInPixels;
        this.heightInPixels = map.heightInPixels;
        this.solidTiles = new Uint8Array(map.width * map.height);

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

        const rawTiledLayers = (scene.cache.tilemap.get(mapKey).data as { layers: { name: string; type: string; color?: string }[] }).layers;
        const colliderSetsByLayerName: Record<string, ColliderSet[]> = {
            Colliders: [this.y0Colliders, this.y1Colliders],
            Y0Colliders: [this.y0Colliders],
            Y1Colliders: [this.y1Colliders],
        };

        rawTiledLayers.forEach((rawLayer, layerIndex) => {
            const layerName = rawLayer.name;
            this.layerIndexByName.set(layerName, layerIndex);

            if (rawLayer.type === 'tilelayer') {
                const tileLayer = map.createLayer(layerName, tilesets)!;
                tileLayer.setDepth(layerIndex).setVisible(layerName !== 'FloorCollider');
                tileLayer.forEachTile((tile) => {
                    if (tile.properties.collider === true) this.solidTiles[tile.y * map.width + tile.x] = 1;
                });
                return;
            }

            if (rawLayer.type !== 'objectgroup') return;

            const objects = map.getObjectLayer(layerName)!.objects;

            objects.forEach((tileObject) => {
                const tileGid = tileObject.gid;
                if (tileGid === undefined) return;

                const tileset = map.tilesets.find((candidateTileset) => candidateTileset.containsTileIndex(tileGid));
                const colliderProperty =
                    getTiledProperty(tileObject, 'collider') ??
                    (tileset?.getTileProperties(tileGid) as { collider?: unknown } | null | undefined)?.collider;
                if (colliderProperty !== true) return;

                this.solidTiles[
                    (Math.ceil((tileObject.y ?? 0) / map.tileHeight) - 1) * map.width +
                        Math.floor((tileObject.x ?? 0) / map.tileWidth)
                ] = 1;
            });

            const colliderSets = colliderSetsByLayerName[layerName];
            if (colliderSets) {
                const segments = objectLayerToSegments(objects);
                const circles = objectLayerToCircles(objects);
                colliderSets.forEach((colliderSet) => {
                    colliderSet.segments.push(...segments);
                    colliderSet.circles.push(...circles);
                });
            } else if (layerName === 'Players-NPC') {
                objects.filter((spawnObject) => spawnObject.point).forEach((spawnObject) => {
                    this.spawnPoints.set(spawnObject.name, {
                        x: spawnObject.x!,
                        y: spawnObject.y!,
                        heightLevel: (getTiledProperty(spawnObject, 'heightlevel') as number | undefined) ?? 0,
                    });
                });
            } else if (layerName === 'Triggers') {
                objects.forEach((triggerObject) => {
                    const targetHeightLevel = getTiledProperty(triggerObject, 'targetlevel');
                    const targetMapKey = getTiledProperty(triggerObject, 'targetmap');
                    const targetSpawnName = getTiledProperty(triggerObject, 'targetspawn');

                    const action: LevelTriggerAction | undefined =
                        typeof targetMapKey === 'string' && typeof targetSpawnName === 'string'
                            ? { type: 'map', targetMapKey, targetSpawnName }
                            : typeof targetHeightLevel === 'number'
                              ? { type: 'heightLevel', targetHeightLevel }
                              : undefined;
                    if (!action) return;

                    const triggerCircle = tiledObjectToCircle(triggerObject);
                    this.triggers.push({
                        segments: tiledObjectToSegments(triggerObject),
                        circles: triggerCircle ? [triggerCircle] : [],
                        action,
                    });
                });
            }

            const gids = new Set(objects.flatMap((object) => object.gid ?? []));
            map.createFromObjects(layerName, [...gids].map((gid) => ({ gid }))).forEach((sprite) =>
                (sprite as Phaser.GameObjects.Sprite).setDepth(layerIndex)
            );

            if (DEBUG_DRAW_LAYERS[layerName]) {
                drawShapeLayer(scene.add.graphics().setDepth(layerIndex), objects, rawLayer.color);
            }
        });

        map.getLayer('FloorCollider')?.tilemapLayer.forEachTile((tile) => {
            if (typeof tile.properties.collider === 'boolean') {
                this.solidTiles[tile.y * map.width + tile.x] = tile.properties.collider ? 1 : 0;
            }
        });
    }

    getPlayerDepth(heightLevel: number): number {
        const y1LayerIndex = this.layerIndexByName.get('Y1Layer');
        const playerTopsLayerIndex = this.layerIndexByName.get('PlayerTops');

        const desiredDepth =
            heightLevel === 1 && y1LayerIndex !== undefined
                ? y1LayerIndex + DEPTH_OFFSET_BETWEEN_LAYERS
                : (this.layerIndexByName.get('Players-NPC') ?? 0);

        return Math.min(desiredDepth, (playerTopsLayerIndex ?? Infinity) - DEPTH_OFFSET_BETWEEN_LAYERS);
    }

    getTileSegments(heightLevel: number, minX: number, minY: number, maxX: number, maxY: number): Segment[] {
        if (heightLevel !== 0) return [];

        const { width, height, tileWidth, tileHeight } = this.map;
        const segments: Segment[] = [];

        for (let tileY = Math.floor(minY / tileHeight); tileY <= Math.floor(maxY / tileHeight); tileY++) {
            for (let tileX = Math.floor(minX / tileWidth); tileX <= Math.floor(maxX / tileWidth); tileX++) {
                const isInsideMap = tileX >= 0 && tileX < width && tileY >= 0 && tileY < height;
                if (isInsideMap && this.solidTiles[tileY * width + tileX] === 0) continue;

                segments.push(...rectangleToSegments(tileX * tileWidth, tileY * tileHeight, tileWidth, tileHeight));
            }
        }

        return segments;
    }
}