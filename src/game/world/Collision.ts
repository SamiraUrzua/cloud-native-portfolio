import { Circle, closestPointOnSegment, Segment } from '@/game/world/TiledShapes';

const SKIN_DISTANCE = 0.05;
const MAX_ITERATIONS = 4;

export function circleOverlapsShapes(
    centerX: number,
    centerY: number,
    radius: number,
    segments: Segment[],
    circles: Circle[]
): boolean {
    return (
        segments.some((segment) => {
            const closestPoint = closestPointOnSegment(centerX, centerY, segment);
            return Math.hypot(closestPoint.x - centerX, closestPoint.y - centerY) <= radius;
        }) ||
        circles.some((circle) => Math.hypot(circle.x - centerX, circle.y - centerY) <= circle.radius + radius)
    );
}

export function resolveCircleMovement(
    startX: number,
    startY: number,
    radius: number,
    displacementX: number,
    displacementY: number,
    segments: Segment[],
    circles: Circle[]
): { x: number; y: number } {
    const broadphaseRadius = Math.hypot(displacementX, displacementY) + radius;
    const candidateSegments = segments.filter((segment) => {
        const closestPoint = closestPointOnSegment(startX, startY, segment);
        return Math.hypot(closestPoint.x - startX, closestPoint.y - startY) <= broadphaseRadius;
    });
    const candidateCircles = circles.filter(
        (circle) => Math.hypot(circle.x - startX, circle.y - startY) - circle.radius <= broadphaseRadius
    );

    const recordedNormals: { x: number; y: number }[] = [];
    let positionX = startX;
    let positionY = startY;
    let remainingX = displacementX;
    let remainingY = displacementY;

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        const remainingLength = Math.hypot(remainingX, remainingY);
        if (remainingLength === 0) break;

        let earliestImpactTime = Infinity;
        let hitSegment: Segment | undefined;
        let hitCircle: Circle | undefined;

        for (const segment of candidateSegments) {
            const segmentDeltaX = segment.x2 - segment.x1;
            const segmentDeltaY = segment.y2 - segment.y1;
            const segmentLength = Math.hypot(segmentDeltaX, segmentDeltaY);
            const impactTimes: number[] = [];

            if (segmentLength > 0) {
                const directionX = segmentDeltaX / segmentLength;
                const directionY = segmentDeltaY / segmentLength;

                for (const side of [1, -1]) {
                    const sideNormalX = -directionY * side;
                    const sideNormalY = directionX * side;
                    const startDistance = (positionX - segment.x1) * sideNormalX + (positionY - segment.y1) * sideNormalY;
                    const approachSpeed = -(remainingX * sideNormalX + remainingY * sideNormalY);
                    if (startDistance < 0 || approachSpeed <= 0) continue;

                    const impactTime = Math.max(0, (startDistance - radius) / approachSpeed);
                    const distanceAlongSegment =
                        (positionX + remainingX * impactTime - segment.x1) * directionX +
                        (positionY + remainingY * impactTime - segment.y1) * directionY;
                    if (distanceAlongSegment >= 0 && distanceAlongSegment <= segmentLength) {
                        impactTimes.push(impactTime);
                    }
                }
            }

            for (const endpoint of [{ x: segment.x1, y: segment.y1 }, { x: segment.x2, y: segment.y2 }]) {
                const offsetX = positionX - endpoint.x;
                const offsetY = positionY - endpoint.y;
                const halfLinearCoefficient = offsetX * remainingX + offsetY * remainingY;
                if (halfLinearCoefficient >= 0) continue;

                const quadraticCoefficient = remainingLength * remainingLength;
                const constantCoefficient = offsetX * offsetX + offsetY * offsetY - radius * radius;
                const discriminant = halfLinearCoefficient * halfLinearCoefficient - quadraticCoefficient * constantCoefficient;
                if (discriminant < 0) continue;

                impactTimes.push(
                    constantCoefficient <= 0
                        ? 0
                        : (-halfLinearCoefficient - Math.sqrt(discriminant)) / quadraticCoefficient
                );
            }

            const segmentImpactTime = Math.min(...impactTimes);
            if (segmentImpactTime <= 1 && segmentImpactTime < earliestImpactTime) {
                earliestImpactTime = segmentImpactTime;
                hitSegment = segment;
                hitCircle = undefined;
            }
        }

        for (const circle of candidateCircles) {
            const offsetX = positionX - circle.x;
            const offsetY = positionY - circle.y;
            const halfLinearCoefficient = offsetX * remainingX + offsetY * remainingY;
            if (halfLinearCoefficient >= 0) continue;

            const combinedRadius = circle.radius + radius;
            const quadraticCoefficient = remainingLength * remainingLength;
            const constantCoefficient = offsetX * offsetX + offsetY * offsetY - combinedRadius * combinedRadius;
            const discriminant = halfLinearCoefficient * halfLinearCoefficient - quadraticCoefficient * constantCoefficient;
            if (discriminant < 0) continue;

            const circleImpactTime =
                constantCoefficient <= 0
                    ? 0
                    : (-halfLinearCoefficient - Math.sqrt(discriminant)) / quadraticCoefficient;
            if (circleImpactTime <= 1 && circleImpactTime < earliestImpactTime) {
                earliestImpactTime = circleImpactTime;
                hitSegment = undefined;
                hitCircle = circle;
            }
        }

        if (!hitSegment && !hitCircle) {
            positionX += remainingX;
            positionY += remainingY;
            break;
        }

        const travelDistance = Math.max(0, remainingLength * earliestImpactTime - SKIN_DISTANCE);
        positionX += (remainingX / remainingLength) * travelDistance;
        positionY += (remainingY / remainingLength) * travelDistance;

        const closestPoint = hitCircle ?? closestPointOnSegment(positionX, positionY, hitSegment!);
        const normalLength = Math.hypot(positionX - closestPoint.x, positionY - closestPoint.y);
        if (normalLength === 0) break;

        const normalX = (positionX - closestPoint.x) / normalLength;
        const normalY = (positionY - closestPoint.y) / normalLength;

        remainingX *= 1 - earliestImpactTime;
        remainingY *= 1 - earliestImpactTime;
        const normalComponent = Math.min(0, remainingX * normalX + remainingY * normalY);
        remainingX -= normalComponent * normalX;
        remainingY -= normalComponent * normalY;

        const opposesOriginalDisplacement = remainingX * displacementX + remainingY * displacementY < 0;
        if (
            opposesOriginalDisplacement ||
            recordedNormals.some((recordedNormal) => remainingX * recordedNormal.x + remainingY * recordedNormal.y < 0)
        ) {
            remainingX = 0;
            remainingY = 0;
        }
        recordedNormals.push({ x: normalX, y: normalY });
    }

    return { x: positionX - startX, y: positionY - startY };
}