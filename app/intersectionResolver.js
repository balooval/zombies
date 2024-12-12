import * as MATH from './utils/math.js';

export function getIntersection(translation, hitbox, margin = 0) {

    if (hitbox.containTranslation(translation) === false) {
        return undefined;
    }

    return hitbox
    .getSegments(margin)
    .filter(segment => {
        const diff = MATH.angleDiff(translation.angle, segment.normalAngle);
        return Math.abs(diff) > Math.PI / 2;
    })
    .map(segment => {
        const intersection = MATH.segmentIntersection(
            translation.startX,
            translation.startY,
            translation.destX,
            translation.destY,
            segment.positions[0][0],
            segment.positions[0][1],
            segment.positions[1][0],
            segment.positions[1][1],
        );
        if (intersection === null) {
            return null;
        }
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