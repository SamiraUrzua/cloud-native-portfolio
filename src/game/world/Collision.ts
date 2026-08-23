import { Circle, closestPointOnSegment, Segment } from '@/game/world/TiledShapes';

export const PLAYER_COLLIDER_RADIUS = 8 - 0.1;
export const MAX_DETOUR_DISTANCE = 64;
export const DETOUR_FORWARD_DISTANCE = PLAYER_COLLIDER_RADIUS * 2;
export const DETOUR_SEARCH_RADIUS = PLAYER_COLLIDER_RADIUS + MAX_DETOUR_DISTANCE + DETOUR_FORWARD_DISTANCE;
const SKIN_DISTANCE = 0.05;
const MAX_ITERATIONS = 4;
const MIN_SLIDE_LENGTH_RATIO = 0.001;
const CLEAR_PATH_TOLERANCE = SKIN_DISTANCE / 2;

export function circleOverlapsShapes(centerX: number, centerY: number, segments: Segment[], circles: Circle[]): boolean {
    return (
        segments.some((segment) => {
            const closestPoint = closestPointOnSegment(centerX, centerY, segment);
            return Math.hypot(closestPoint.x - centerX, closestPoint.y - centerY) <= PLAYER_COLLIDER_RADIUS;
        }) ||
        circles.some(
            (circle) => Math.hypot(circle.x - centerX, circle.y - centerY) <= circle.radius + PLAYER_COLLIDER_RADIUS
        )
    );
}

export function resolveCircleMovement(
    startX: number,
    startY: number,
    displacementX: number,
    displacementY: number,
    segments: Segment[],
    circles: Circle[],
    preserveSpeedWhenSliding = false
): { x: number; y: number } {
    const broadphaseRadius = Math.hypot(displacementX, displacementY) + PLAYER_COLLIDER_RADIUS;
    const candidateSegments = segments.filter((segment) => {
        const closestPoint = closestPointOnSegment(startX, startY, segment);
        return Math.hypot(closestPoint.x - startX, closestPoint.y - startY) <= broadphaseRadius;
    });
    const obstacleCircles = [
        ...circles.filter(
            (circle) => Math.hypot(circle.x - startX, circle.y - startY) - circle.radius <= broadphaseRadius
        ),
        ...candidateSegments.flatMap((segment) => [
            { x: segment.x1, y: segment.y1, radius: 0 },
            { x: segment.x2, y: segment.y2, radius: 0 },
        ]),
    ];

    const constraintDirections = [{ x: displacementX, y: displacementY }];
    let positionX = startX;
    let positionY = startY;
    let remainingX = displacementX;
    let remainingY = displacementY;

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        const remainingLength = Math.hypot(remainingX, remainingY);
        if (remainingLength === 0) break;

        const impacts: { time: number; obstacle: Segment | Circle }[] = [];

        for (const segment of candidateSegments) {
            const segmentLength = Math.hypot(segment.x2 - segment.x1, segment.y2 - segment.y1);
            const directionX = (segment.x2 - segment.x1) / segmentLength;
            const directionY = (segment.y2 - segment.y1) / segmentLength;
            const faceNormalX = -directionY;
            const faceNormalY = directionX;
            const signedDistance = (positionX - segment.x1) * faceNormalX + (positionY - segment.y1) * faceNormalY;
            const side = signedDistance < 0 ? -1 : 1;
            const approachSpeed = -side * (remainingX * faceNormalX + remainingY * faceNormalY);
            if (approachSpeed <= 0) continue;

            const impactTime = Math.max(0, (Math.abs(signedDistance) - PLAYER_COLLIDER_RADIUS) / approachSpeed);
            const distanceAlongSegment =
                (positionX + remainingX * impactTime - segment.x1) * directionX +
                (positionY + remainingY * impactTime - segment.y1) * directionY;
            if (distanceAlongSegment >= 0 && distanceAlongSegment <= segmentLength) {
                impacts.push({ time: impactTime, obstacle: segment });
            }
        }

        for (const circle of obstacleCircles) {
            const offsetX = positionX - circle.x;
            const offsetY = positionY - circle.y;
            const halfLinearCoefficient = offsetX * remainingX + offsetY * remainingY;
            if (halfLinearCoefficient >= 0) continue;

            const combinedRadius = circle.radius + PLAYER_COLLIDER_RADIUS;
            const quadraticCoefficient = remainingLength * remainingLength;
            const constantCoefficient = offsetX * offsetX + offsetY * offsetY - combinedRadius * combinedRadius;
            const discriminant = halfLinearCoefficient * halfLinearCoefficient - quadraticCoefficient * constantCoefficient;
            if (discriminant < 0) continue;

            impacts.push({
                time: Math.max(0, (-halfLinearCoefficient - Math.sqrt(discriminant)) / quadraticCoefficient),
                obstacle: circle,
            });
        }

        const earliestImpact = impacts.filter(({ time }) => time <= 1).sort((a, b) => a.time - b.time)[0];
        if (!earliestImpact) {
            positionX += remainingX;
            positionY += remainingY;
            break;
        }

        const { time, obstacle } = earliestImpact;
        const travelDistance = Math.max(0, remainingLength * time - SKIN_DISTANCE);
        positionX += (remainingX / remainingLength) * travelDistance;
        positionY += (remainingY / remainingLength) * travelDistance;

        const closestPoint = 'radius' in obstacle ? obstacle : closestPointOnSegment(positionX, positionY, obstacle);
        const normalLength = Math.hypot(positionX - closestPoint.x, positionY - closestPoint.y);
        const normalX = (positionX - closestPoint.x) / normalLength;
        const normalY = (positionY - closestPoint.y) / normalLength;

        remainingX *= 1 - time;
        remainingY *= 1 - time;
        const lengthBeforeSlide = Math.hypot(remainingX, remainingY);
        const normalComponent = Math.min(0, remainingX * normalX + remainingY * normalY);
        remainingX -= normalComponent * normalX;
        remainingY -= normalComponent * normalY;

        const slideLength = Math.hypot(remainingX, remainingY);
        if (preserveSpeedWhenSliding && slideLength > MIN_SLIDE_LENGTH_RATIO * lengthBeforeSlide) {
            remainingX *= lengthBeforeSlide / slideLength;
            remainingY *= lengthBeforeSlide / slideLength;
        }

        if (constraintDirections.some((direction) => remainingX * direction.x + remainingY * direction.y < 0)) {
            remainingX = 0;
            remainingY = 0;
        }
        constraintDirections.push({ x: normalX, y: normalY });
    }

    return { x: positionX - startX, y: positionY - startY };
}

export function isForwardPathClear(
    startX: number,
    startY: number,
    directionX: number,
    directionY: number,
    segments: Segment[],
    circles: Circle[]
): boolean {
    const forwardOffsetX = directionX * DETOUR_FORWARD_DISTANCE;
    const forwardOffsetY = directionY * DETOUR_FORWARD_DISTANCE;
    const resolvedMovement = resolveCircleMovement(startX, startY, forwardOffsetX, forwardOffsetY, segments, circles);

    return Math.hypot(resolvedMovement.x - forwardOffsetX, resolvedMovement.y - forwardOffsetY) < CLEAR_PATH_TOLERANCE;
}