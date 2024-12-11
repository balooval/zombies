import * as MATH from './utils/math.js';

export function getIntersection(translation, hitbox, margin = 0) {
    const hitboxSegments = hitbox.getSegments(margin);
    
    return hitboxSegments.map(segment => {
        const intersection = MATH.segmentIntersection(
            translation.startX,
            translation.startY,
            translation.destX,
            translation.destY,
            segment[0][0],
            segment[0][1],
            segment[1][0],
            segment[1][1],
        );
        if (intersection === null) {
            return null;
        }MATH.distance
        return {
            x: intersection.x,
            y: intersection.y,
            distance: MATH.distance({ x: translation.startX, y: translation.startY }, intersection),
        };
    })
    .filter(res => res !== null)
    .sort((hitA, hitB) => Math.sign(hitA.distance - hitB.distance))
    .shift();
}