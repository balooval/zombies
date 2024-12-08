import * as MATH from './utils/math.js';

let canvas;
let context;

const mapCanvas = new OffscreenCanvas(160, 120);
const mapContext = mapCanvas.getContext('2d');

export function init(elementId) {
    canvas = document.getElementById(elementId);
    context = canvas.getContext('2d');

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, 160, 120);
}

export function drawNavigationGrid(navigationGrid) {
    const points = [...navigationGrid.values()];
    points.forEach(node => drawPoint(node.x, node.y, '#0000ff', 2));
}

export function drawJourney(nodes) {
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, 160, 120);
    context.drawImage(mapCanvas, 0, 0);

    let prevNode = nodes.shift();
    
    for (const node of nodes) {
        drawLine(prevNode, node, '#ff0000', 1);
        prevNode = node;
    }
}

export function drawBlock(block) {
    const x = toLocalX(block.posX);
    const y = toLocalY(block.posY);
    mapContext.fillStyle = '#303040';
    mapContext.fillRect(x, y, block.width, block.height);

    context.drawImage(mapCanvas, 0, 0);
}

function drawLine(start, end, color, width) {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(toLocalX(start.x), toLocalY(start.y))
    context.lineTo(toLocalX(end.x), toLocalY(end.y))
    context.stroke();
}

function fillePolygon(polygon, color) {
    const points = [...polygon];
    context.fillStyle = color;
    context.beginPath();
    const start = points.shift();
    context.moveTo(toLocalX(start[0]), toLocalY(start[1]));
    for (const point of points) {
        context.lineTo(toLocalX(point[0]), toLocalY(point[1]));
    }
    context.closePath();
    context.fill();
}

function drawPoint(x, y, color, radius) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(toLocalX(x), toLocalY(y), radius, 0, Math.PI * 2);
    context.closePath();
    context.fill();
}

function drawLight(segment, color) {
    const dist = MATH.segmentDistance(segment);
    const distanceByPhoton = 3;
    const photonsCount = dist / distanceByPhoton;
    const lerpStep = 1 / photonsCount;

    let startRadius = 1;
    let alpha = 1;

    context.globalCompositeOperation = 'lighter';

    for (let i = 0; i < photonsCount; i ++) {
        const pos = MATH.lerpPoint(segment[0], segment[1], lerpStep * i);
        drawPoint(pos[0], pos[1], `rgb(0, 0, 255, ${alpha})`, startRadius);
        startRadius *= 1.06;
        alpha *= 0.85;
    }

    context.globalCompositeOperation = 'source-over';
}

function toLocalX(worldX) {
    return worldX + 80;
}

function toLocalY(worldY) {
    return (worldY * -1) + 60;
}