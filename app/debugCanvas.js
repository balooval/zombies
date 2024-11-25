
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
    points.forEach(node => drawPoint(node.x, node.y, '#0000ff'));
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

function drawPoint(x, y, color) {
    mapContext.fillStyle = color;
    mapContext.beginPath();
    mapContext.arc(toLocalX(x), toLocalY(y), 2, 0, Math.PI * 2);
    mapContext.closePath();
    mapContext.fill();
}


function toLocalX(worldX) {
    return worldX + 80;
}

function toLocalY(worldY) {
    return (worldY * -1) + 60;
}