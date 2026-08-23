import Phaser from 'phaser';

export interface Segment {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface Circle {
    x: number;
    y: number;
    radius: number;
}

function pointsToSegments(originX: number, originY: number, points: { x: number; y: number }[]): Segment[] {
    return points.slice(0, -1).map((point, index) => ({
        x1: originX + point.x,
        y1: originY + point.y,
        x2: originX + points[index + 1].x,
        y2: originY + points[index + 1].y,
    }));
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
    const segmentDeltaX = segment.x2 - segment.x1;
    const segmentDeltaY = segment.y2 - segment.y1;
    const projection =
        ((pointX - segment.x1) * segmentDeltaX + (pointY - segment.y1) * segmentDeltaY) /
        (segmentDeltaX * segmentDeltaX + segmentDeltaY * segmentDeltaY);
    const clampedProjection = Math.max(0, Math.min(1, projection));

    return { x: segment.x1 + clampedProjection * segmentDeltaX, y: segment.y1 + clampedProjection * segmentDeltaY };
}

export function tiledObjectToSegments(object: Phaser.Types.Tilemaps.TiledObject): Segment[] {
    const { x = 0, y = 0, width = 0, height = 0 } = object;

    if (object.gid !== undefined || object.ellipse || object.point) return [];
    if (object.polyline) return pointsToSegments(x, y, object.polyline);
    if (object.polygon) return pointsToSegments(x, y, [...object.polygon, object.polygon[0]]);

    return rectangleToSegments(x, y, width, height);
}

export function tiledObjectToCircle(object: Phaser.Types.Tilemaps.TiledObject): Circle | undefined {
    if (!object.ellipse) return undefined;

    const { x = 0, y = 0, width = 0, height = 0 } = object;
    if (width !== height) {
        throw new Error(`TiledShapes: ellipse "${object.name}" is not circular (width ${width} !== height ${height})`);
    }

    return { x: x + width / 2, y: y + height / 2, radius: width / 2 };
}

export function objectLayerToSegments(objects: Phaser.Types.Tilemaps.TiledObject[]): Segment[] {
    return objects.filter((object) => object.visible).flatMap((object) => tiledObjectToSegments(object));
}

export function objectLayerToCircles(objects: Phaser.Types.Tilemaps.TiledObject[]): Circle[] {
    return objects.filter((object) => object.visible).flatMap((object) => tiledObjectToCircle(object) ?? []);
}

export function drawShapeLayer(
    graphics: Phaser.GameObjects.Graphics,
    objects: Phaser.Types.Tilemaps.TiledObject[],
    color = '#ffffff'
): void {
    graphics.lineStyle(1, Phaser.Display.Color.HexStringToColor(color).color, 1);

    objectLayerToSegments(objects).forEach((segment) => {
        graphics.lineBetween(segment.x1, segment.y1, segment.x2, segment.y2);
    });

    objectLayerToCircles(objects).forEach((circle) => {
        graphics.strokeCircle(circle.x, circle.y, circle.radius);
    });
}