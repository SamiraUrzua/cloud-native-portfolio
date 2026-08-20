import Phaser from 'phaser';

export interface Segment {
  x1: number; y1: number;
  x2: number; y2: number;
}

export interface Circle {
  x: number; y: number;
  radius: number;
}

function pointsToSegments(originX: number, originY: number, points: { x: number; y: number }[]): Segment[] {
  const segments: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    segments.push({
      x1: originX + points[i].x,
      y1: originY + points[i].y,
      x2: originX + points[i + 1].x,
      y2: originY + points[i + 1].y,
    });
  }
  return segments;
}

export function polylineToSegments(originX: number, originY: number, points:
  { x: number; y: number }[]): Segment[] {
  return pointsToSegments(originX, originY, points);
}

export function polygonToSegments(originX: number, originY: number, points:
  { x: number; y: number }[]): Segment[] {
  return pointsToSegments(originX, originY, [...points, points[0]]);
}

export function rectangleToSegments(x: number, y: number, width: number, height: number): Segment[] {
  return pointsToSegments(x, y, [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
    { x: 0, y: 0 },
  ]);
}

export function closestPointOnSegment(pointX: number, pointY: number, segment: Segment): { x: number; y: number } {
  const segDx = segment.x2 - segment.x1;
  const segDy = segment.y2 - segment.y1;
  const segLengthSquared = segDx * segDx + segDy * segDy;

  if (segLengthSquared === 0) return { x: segment.x1, y: segment.y1 };

  const t = Math.max(0, Math.min(1, ((pointX - segment.x1) * segDx + (pointY - segment.y1) * segDy) / segLengthSquared));

  return { x: segment.x1 + t * segDx, y: segment.y1 + t * segDy };
}

export function segmentBoundingBox(segment: Segment): {minX: number; minY: number; maxX: number; maxY: number;} {
  return {
    minX: Math.min(segment.x1, segment.x2),
    minY: Math.min(segment.y1, segment.y2),
    maxX: Math.max(segment.x1, segment.x2),
    maxY: Math.max(segment.y1, segment.y2),
  };
}

export interface TiledObjectLayerJSON {
    x: number;
    y: number;
    color?: string;
    objects: Phaser.Types.Tilemaps.TiledObject[];
}

const DEFAULT_LAYER_COLOR = '#ffffff';
export const SHAPE_OBJECT_TYPE = 'shape';

export function tiledObjectToSegments(
    layerOriginX: number,
    layerOriginY: number,
    object: Phaser.Types.Tilemaps.TiledObject
): Segment[] {
    if (object.gid !== undefined) {
        return [];
    }

    if (object.x === undefined || object.y === undefined) {
        return [];
    }

    const originX = layerOriginX + object.x;
    const originY = layerOriginY + object.y;

    if (object.polyline) {
        return polylineToSegments(originX, originY, object.polyline);
    }

    if (object.polygon) {
        return polygonToSegments(originX, originY, object.polygon);
    }

    if (object.ellipse || object.point) {
        return [];
    }

    if (object.width === undefined || object.height === undefined) {
        return [];
    }

    return rectangleToSegments(originX, originY, object.width, object.height);
}

export function tiledObjectToCircle(
    layerOriginX: number,
    layerOriginY: number,
    object: Phaser.Types.Tilemaps.TiledObject
): Circle | undefined {
    if (!object.ellipse) {
        return undefined;
    }

    if (object.x === undefined || object.y === undefined || object.width === undefined || object.height === undefined) {
        return undefined;
    }

    if (object.width !== object.height) {
        throw new Error(
            `TiledShapes: ellipse "${object.name}" is not circular (width ${object.width} !== height ${object.height}); only circular ellipses are supported as colliders`
        );
    }

    return {
        x: layerOriginX + object.x + object.width / 2,
        y: layerOriginY + object.y + object.height / 2,
        radius: object.width / 2,
    };
}

export function objectLayerToSegments(
    originX: number,
    originY: number,
    objects: Phaser.Types.Tilemaps.TiledObject[]
): Segment[] {
    return objects
        .filter((object) => object.visible)
        .flatMap((object) => tiledObjectToSegments(originX, originY, object));
}

export function objectLayerToCircles(
    originX: number,
    originY: number,
    objects: Phaser.Types.Tilemaps.TiledObject[]
): Circle[] {
    return objects
        .filter((object) => object.visible)
        .map((object) => tiledObjectToCircle(originX, originY, object))
        .filter((circle): circle is Circle => circle !== undefined);
}

export function drawShapeLayer(
    graphics: Phaser.GameObjects.Graphics,
    layer: TiledObjectLayerJSON
): void {
    const color = Phaser.Display.Color.HexStringToColor(
        layer.color ?? DEFAULT_LAYER_COLOR
    ).color;

    graphics.lineStyle(1, color, 1);

    objectLayerToSegments(layer.x, layer.y, layer.objects).forEach((segment) => {
        graphics.lineBetween(segment.x1, segment.y1, segment.x2, segment.y2);
    });

    objectLayerToCircles(layer.x, layer.y, layer.objects).forEach((circle) => {
        graphics.strokeCircle(circle.x, circle.y, circle.radius);
    });
}