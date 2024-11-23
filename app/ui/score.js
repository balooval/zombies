
const pointContainerId = 'container_points';

let points = 0;
let animationTimeoutId;
let pointContainer;

export function addPoints(pointsToAdd) {
    this.setPoints(points + pointsToAdd);
}

export function getPoints(points) {
    return points;
}

export function setPoints(newPoints) {
    points = newPoints;
    getContainer().innerHTML = points + '';
    getContainer().classList.add('changed');
    
    clearTimeout(animationTimeoutId);
    animationTimeoutId = setTimeout(removeChangedClass, 200);
}

function removeChangedClass() {
    getContainer().classList.remove('changed');
}

function getContainer() {
    if (!pointContainer) {
        pointContainer = document.getElementById(pointContainerId);
    }
    return pointContainer;
}