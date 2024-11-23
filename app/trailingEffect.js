import {
	CanvasTexture,
	Mesh,
	PlaneGeometry,
	MeshBasicMaterial,
	DoubleSide,
	Vector2
} from '../vendor/three.module.js';
import * as Renderer from './renderer.js';
import {WIDTH, HEIGHT} from './map/map.js';

let canvasTexture;
const sprites = new Map();
const resolution = 2;

let textureW;
let textureH;
let canvas;
let context;
let canvasBlur;
let contextBlur;


export function init() {
	textureW = WIDTH * resolution;
	textureH = HEIGHT * resolution;
	canvasBlur = document.createElement('canvas');
	canvasBlur.width = textureW;
	canvasBlur.height = textureH;
	contextBlur = canvasBlur.getContext('2d', {willReadFrequently: true});
	canvas = document.createElement('canvas');
	canvas.width = textureW;
	canvas.height = textureH;
	context = canvas.getContext('2d', {willReadFrequently: true});

	canvasTexture = new CanvasTexture(canvas);
	const meshScreen = new Mesh(
		new PlaneGeometry(WIDTH / 1, HEIGHT / 1, 1), 
		new MeshBasicMaterial({color: 0xffffff, side: DoubleSide, map: canvasTexture, transparent:true})
		// new MeshBasicMaterial({color: 0xff0000, side: DoubleSide})
	);
	meshScreen.position.z = 5;

	Renderer.scene.add(meshScreen);
}

export function add(sprite, color, size, length = 8) {
	sprites.set(sprite, {
		length: length,
		color: color,
		size: size,
		positions: [worldToCanvasPosition(sprite.getPosition())],
	});
}

export function remove(sprite) {
	sprites.delete(sprite);
}

export function update() {
	contextBlur.clearRect(0, 0, textureW, textureH);
	contextBlur.globalAlpha = 0.8;
	contextBlur.drawImage(canvas, 0, 0);
	contextBlur.globalAlpha = 1;
	
	for (const sprite of sprites.keys()) {
		const spriteProps = sprites.get(sprite);
		spriteProps.positions.push(worldToCanvasPosition(sprite.getPosition()));
		spriteProps.positions = spriteProps.positions.slice(spriteProps.length * -1);
		sprites.set(sprite, spriteProps);
		drawLine(sprite);
	}
	
	context.clearRect(0, 0, textureW, textureH);
	context.drawImage(canvasBlur, 0, 0);

	canvasTexture.needsUpdate = true;
}

function drawLine(sprite) {
	const spriteProps = sprites.get(sprite);
	
	for (let i = 1; i < spriteProps.positions.length; i ++) {
		contextBlur.lineWidth = i * spriteProps.size;
		contextBlur.strokeStyle = 'rgba(' + spriteProps.color + ', ' + (i * 0.02) + ')';
		const previousPosition = spriteProps.positions[i - 1];
		const currentPosition = spriteProps.positions[i];
		contextBlur.beginPath();
		contextBlur.moveTo(previousPosition.x, previousPosition.y);
		contextBlur.lineTo(currentPosition.x, currentPosition.y);
		contextBlur.stroke();
	}
}

function worldToCanvasPosition(position) {
	return new Vector2(

		(position.x * resolution) + (WIDTH / 2) * resolution,
		textureH - ((position.y * resolution) + (HEIGHT / 2) * resolution),
	);
}