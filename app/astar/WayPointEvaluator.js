import * as MATH from '../utils/math.js';

class BasicWayPointEvaluator {
    constructor() {
        
    }
    
    evaluate(_waypoint, _destinationWayPoint) {
        const remainingDistance = calcNodesDistance(_waypoint, _destinationWayPoint)
        const distance = _waypoint.distanceFromStart + remainingDistance;
        const cost = distance;
        return cost;
    }
}

function calcNodesDistance(waypointA, waypointB) {
    return MATH.distance(waypointA.node, waypointB.node);
}

export {BasicWayPointEvaluator as default};