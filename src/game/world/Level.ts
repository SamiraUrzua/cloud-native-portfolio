import Phaser from 'phaser';
import { Player } from '@/game/entities/Player';
import { Circle, drawShapeLayer, objectLayerToCircles, objectLayerToSegments, Segment, tiledObjectToCircle, tiledObjectToSegments } from '@/game/world/TiledShapes';

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

const DEBUG_SHAPE_LAYERS: Record<string, boolean> = {
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
    private readonly scene: Phaser.Scene;
    private readonly tileLayers: Phaser.Tilemaps.TilemapLayer[] = [];
    private readonly tileColliders: Phaser.Physics.Arcade.Collider[] = [];

    constructor(scene: Phaser.Scene, mapKey: string) {
        this.scene = scene;
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
                this.tileLayers.push(tileLayer);
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

            if (DEBUG_SHAPE_LAYERS[layerName] && objects.length > 0) {
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

        for (let tileY = 0; tileY < map.height; tileY++) {
            for (let tileX = 0; tileX < map.width; tileX++) {
                let anyLayerWantsCollider = false;
                let anyLayerForbidsCollider = false;
                const tilesRequestingCollider: Phaser.Tilemaps.Tile[] = [];

                for (const tileLayer of this.tileLayers) {
                    const tile = tileLayer.getTileAt(tileX, tileY);
                    if (!tile) continue;

                    const colliderProperty = tile.properties.collider;
                    if (colliderProperty === true) {
                        anyLayerWantsCollider = true;
                        tilesRequestingCollider.push(tile);
                    } else if (colliderProperty === false) {
                        anyLayerForbidsCollider = true;
                    }
                }

                if (anyLayerWantsCollider && !anyLayerForbidsCollider) {
                    tilesRequestingCollider.forEach((tile) => tile.setCollision(true, true, true, true, false));
                }
            }
        }

        this.tileLayers.forEach((tileLayer) => {
            tileLayer.calculateFacesWithin(0, 0, map.width, map.height);
        });
    }

    collideWith(player: Player): void {
        this.tileLayers.forEach((tileLayer) => {
            this.tileColliders.push(this.scene.physics.add.collider(player, tileLayer));
        });
    }

    setTileCollisionsEnabled(enabled: boolean): void {
        this.tileColliders.forEach((tileCollider) => {
            tileCollider.active = enabled;
        });
    }
}