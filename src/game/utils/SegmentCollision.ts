import Phaser from 'phaser';

export interface Segment {
  x1: number; y1: number;
  x2: number; y2: number;
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

export function polylineToSegments(originX: number,originY: number, points: 
  { x: number; y: number }[]): Segment[] {
  return pointsToSegments(originX, originY, points);
}

export function polygonToSegments(originX: number, originY: number, points: 
  { x: number; y: number }[]): Segment[] {
  return pointsToSegments(originX, originY, [...points,points[0],]);
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

export function segmentAABB(segment: Segment): {minX: number; minY: number; maxX: number; maxY: number;} {
  return {
    minX: Math.min(segment.x1, segment.x2),
    minY: Math.min(segment.y1, segment.y2),
    maxX: Math.max(segment.x1, segment.x2),
    maxY: Math.max(segment.y1, segment.y2),
  };
}

export function closestPointOnSegment(segment: Segment, px: number, py: number): 
  { x: number; y: number; distance: number } {
  const dx = segment.x2 - segment.x1;
  const dy = segment.y2 - segment.y1;
  const lengthSquared = dx * dx + dy * dy;

  let t = lengthSquared === 0
    ? 0
    : ((px - segment.x1) * dx + (py - segment.y1) * dy) / lengthSquared;

  t = Phaser.Math.Clamp(t, 0, 1);

  const closestX = segment.x1 + t * dx;
  const closestY = segment.y1 + t * dy;
  const distance = Phaser.Math.Distance.Between(px, py, closestX, closestY);

  return { x: closestX, y: closestY, distance };
}

export function circleSegmentPushOut(segment: Segment, px: number, py: number, radius: number): 
  { x: number; y: number } | null {
  const closest = closestPointOnSegment(segment, px, py);

  if (closest.distance >= radius || closest.distance === 0) {
    return closest.distance === 0 ? { x: 0, y: radius } : null;
  }

  const overlap = radius - closest.distance;
  const normalX = (px - closest.x) / closest.distance;
  const normalY = (py - closest.y) / closest.distance;

  return {
    x: normalX * overlap,
    y: normalY * overlap,
  };
}