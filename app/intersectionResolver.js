
import {
    segmentIntersection
 } from './utils/math.js';

export function getIntersection(translation, hitbox) {
    const hitboxSegments = hitbox.getSegments();
    // console.log(hitboxSegments);
    // console.log(translation.startX, translation.startY, translation.destX, translation.destY);

    return hitboxSegments.map(segment => {
        
        return segmentIntersection(
            translation.startX,
            translation.startY,
            translation.destX,
            translation.destY,
            segment[0][0],
            segment[0][1],
            segment[1][0],
            segment[1][1],
        );
    }).filter(res => res !== null)
    .pop();
}