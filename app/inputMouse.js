import Evt from './utils/event.js';

export const MOUSE_DOWN = 'DOWN';
export const MOUSE_UP = 'UP';
export const screenPosition = [0, 0];
export const worldPosition = [0, 0];
export let evt = null;

let worldWidth = 1;
let worldHeight = 1;
let ratioWidth = 1;
let ratioHeight = 1;

export function init(elementId, inputWorldWidth, inputWorldHeight) {
    evt = new Evt();
    const targetElement = document.getElementById(elementId);
    const domRect = targetElement.getBoundingClientRect();
    worldWidth = inputWorldWidth;
    worldHeight = inputWorldHeight;
    ratioWidth = worldWidth / domRect.width;
    ratioHeight = worldHeight / domRect.height;

    targetElement.addEventListener('mousemove', onMouseMove);
    targetElement.addEventListener('mousedown', onMouseDown);
    targetElement.addEventListener('mouseup', onMouseUp);
}

function onMouseDown() {
    evt.fireEvent(MOUSE_DOWN, worldPosition);
}

function onMouseUp() {
    evt.fireEvent(MOUSE_UP, worldPosition);
}

function onMouseMove(evt) {
    var rect = evt.target.getBoundingClientRect();
    screenPosition[0] = evt.clientX - rect.left;
    screenPosition[1] = evt.clientY - rect.top;

    worldPosition[0] = (screenPosition[0] * ratioWidth) - (worldWidth / 2);
    worldPosition[1] = (worldHeight / 2) - (screenPosition[1] * ratioHeight);
}