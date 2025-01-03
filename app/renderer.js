import * as FogShader from './shaders/fog.js';
import * as LightingShader from './shaders/applyLights.js';
import * as MATH from './utils/math.js';
import * as Mouse from './inputMouse.js';
import * as TextureLoader from './net/loaderTexture.js';

import {
	BoxGeometry,
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	LinearFilter,
	Mesh,
	MeshBasicMaterial,
	NearestFilter,
	OrthographicCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Vector2,
	Vector3,
	WebGLRenderTarget,
	WebGLRenderer,
} from '../vendor/three.module.js';

import LightCanvas from './lightCanvas.js';

export let renderer;
export let camera;

export let controls;
export let scene = null;
export const worldWidth = 160;
export const worldHeight = 120;

const ratio = 4 / 3;
let ratioWidth = 1;
let ratioHeight = 1;

let finalScene;
export let lightScene;
export let fogScene;
export let fogResultScene;
export let renderTargetGame;
let renderTargetLight;

let fogInput;
let fogOutput;
let fogRenderA;
let fogRenderB;
let fogMesh;
let bufferFinalMesh;
let time = 0;
let rand = 0;
let canvasTexture;
let canvasTextureLights;

const canvasFogFlux = new OffscreenCanvas(worldWidth, worldHeight);
let contextFogFlux;
const canvasFogWall = new OffscreenCanvas(worldWidth, worldHeight);
let contextFogWall;
const fogWind = {x: 128, y: 128};

let mousePositions = [];


export const lights = [new Vector2(0, 0), new Vector2(-30, 20)];

export function init(elmtId) {
	const mainElmt = document.getElementById(elmtId);
	renderer = new WebGLRenderer();
	mainElmt.appendChild(renderer.domElement);
	camera = new OrthographicCamera(worldWidth / -2, worldWidth / 2, worldHeight / 2, worldHeight / -2, 1, 1000);

	window.onresize = function () {
		renderer.setSize(mainElmt.clientWidth, mainElmt.clientWidth / ratio);
		camera.aspect = ratio;
		camera.updateProjectionMatrix();
	};

	window.onresize();
	scene = new Scene();
	camera.position.set(0, 0, 100);
	camera.lookAt(new Vector3(0, 0, 0));
	scene.add(camera);


	const domRect = mainElmt.getBoundingClientRect();
    ratioWidth = worldWidth / domRect.width;
    ratioHeight = worldHeight / domRect.height;

	renderTargetLight = new WebGLRenderTarget(mainElmt.clientWidth, mainElmt.clientWidth / ratio, { minFilter: LinearFilter, magFilter: NearestFilter});
	renderTargetGame = new WebGLRenderTarget(mainElmt.clientWidth, mainElmt.clientWidth / ratio, { minFilter: LinearFilter, magFilter: NearestFilter});
	

	contextFogWall = canvasFogWall.getContext('2d');
	contextFogWall.fillStyle = 'rgb(0, 0, 0)';
	contextFogWall.fillRect(0, 0, worldWidth, worldHeight);
	contextFogFlux = canvasFogFlux.getContext('2d');
	contextFogFlux.fillStyle = 'rgb(128, 128, 0)';
	contextFogFlux.fillRect(0, 0, worldWidth, worldHeight);
	canvasTextureLights = new CanvasTexture(LightCanvas.canvasFinalLights);
	canvasTextureLights.needsUpdate = true;
	canvasTexture = new CanvasTexture(canvasFogFlux);
	canvasTexture.needsUpdate = true;

	
	fogRenderA = new WebGLRenderTarget(worldWidth, worldHeight, { minFilter: LinearFilter, magFilter: LinearFilter});
	fogRenderB = new WebGLRenderTarget(worldWidth, worldHeight, { minFilter: LinearFilter, magFilter: LinearFilter});

	fogInput = fogRenderA;
	fogOutput = fogRenderB;
	fogScene = new Scene();
	fogResultScene = new Scene();
	fogMesh = buildFogMesh(worldWidth, worldHeight);
	fogResultScene.add(fogMesh);

	
	const bufferLightMesh = buildBufferLightMesh(worldWidth, worldHeight);
	lightScene = new Scene();
	lightScene.add(bufferLightMesh);
	
	bufferFinalMesh = buildFinalMesh(worldWidth, worldHeight);
	finalScene = new Scene();
	finalScene.add(bufferFinalMesh);
}

export function setFogBlock(posX, posY, width, height) {
	const x = toSmallLocalX(posX);
    const y = toSmallLocalY(posY);
    contextFogWall.fillStyle = 'rgb(0, 0, 255)';
    contextFogWall.fillRect(x, y, width, height);
}

export function setFogFlux(xA, yA, xB, yB, width, power) {
	return;
	const startX = toSmallLocalX(xA);
	const startY = toSmallLocalY(yA);
	const endX = toSmallLocalX(xB);
	const endY = toSmallLocalY(yB);
	const angle = MATH.pointsAngle([startX, startY], [endX, endY]);
	const speed = power;
	const colFactor = 128 * speed;
	const moveX = Math.cos(angle) * colFactor;
	const moveY = Math.sin(angle) * colFactor;
	const color = `rgb(${128 + moveX}, ${128 - moveY}, 0)`;
	drawLine(contextFogFlux, [startX, startY], [endX, endY], color, width);
}

export function drawFogFlux(posX, posY, scale) {
	return;
	const spriteSize = 64 * scale;
	const x = toSmallLocalX(posX) - (spriteSize * 0.5);
	const y = toSmallLocalY(posY) - (spriteSize * 0.5);

	contextFogFlux.drawImage(
		TextureLoader.get('fogRadialFlux').image,
		x,
		y,
		spriteSize,
		spriteSize,
	);
}

export function start() {
	// renderer.setRenderTarget(null);
	// renderer.setClearColor(0x2a2958, 1);
	// renderer.clear();
	// renderer.render(scene, camera);

	time ++;


	renderer.autoClear = false;
	// Enlever commentaire pour avoir le rendu du fog
	// renderer.setRenderTarget(fogInput)
	// renderer.render(fogScene, camera);

	renderer.setRenderTarget(fogOutput)
	renderer.setClearColor(0x000000, 1);
	renderer.clear();
	renderer.render(fogResultScene, camera);
	
	// renderer.setRenderTarget(null);
	// renderer.setClearColor(0x000000, 1);
	// renderer.clear();
	// renderer.render(fogResultScene, camera);

	const temp = fogInput
	fogInput = fogOutput;
	fogOutput = temp;

	rand = (Math.random() * 2) - 1;
	const randY = (Math.random() * 2) - 1;

	mousePositions.push(
		[
			Mouse.screenPosition[0] * ratioWidth,
			Mouse.screenPosition[1] * ratioHeight,
		]
	);
	mousePositions = mousePositions.slice(-20);

	fogWind.x = Math.max(90, Math.min(166, MATH.randomize(fogWind.x, 5)));
	fogWind.y = Math.max(90, Math.min(166, MATH.randomize(fogWind.y, 5)));

	// console.log('fogWind', fogWind.x, fogWind.y);

	// contextFogFlux.fillStyle = 'rgba(128, 128, 0, 0.1)';
	contextFogFlux.fillStyle = `rgba(${fogWind.x}, ${fogWind.y}, 0, 0.1)`;
	contextFogFlux.fillRect(0, 0, worldWidth, worldHeight);

	contextFogFlux.globalCompositeOperation = 'lighter';
	contextFogFlux.drawImage(canvasFogWall, 0, 0)
	contextFogFlux.globalCompositeOperation = 'source-over';


	
	// for (let i = 1; i < mousePositions.length; i ++) {
	// 	setFogFlux(
	// 		mousePositions[i - 1][0],
	// 		mousePositions[i - 1][1],
	// 		mousePositions[i][0],
	// 		mousePositions[i][1],
	// 		15
	// 	);
	// }
	canvasTexture.needsUpdate = true;
	canvasTextureLights.needsUpdate = true;

	bufferFinalMesh.material.map = fogOutput.texture;
	fogMesh.material.uniforms.time.value = time;
	fogMesh.material.uniforms.rand.value = rand;
	fogMesh.material.uniforms.fogMap.value = fogInput.texture;
		
		
	bufferFinalMesh.material.uniforms.fogMap.value = fogOutput.texture;
	
	renderer.setRenderTarget(renderTargetGame)
	renderer.setClearColor(0x2a2958, 1);
	renderer.clear();
	renderer.render(scene, camera);

	// renderer.setRenderTarget(renderTargetLight)
	// renderer.setClearColor(0x808080, 1);
	// renderer.clear();
	// renderer.render(lightScene, camera);
	
	renderer.setRenderTarget(null);
	renderer.setClearColor(0x000000, 1);
	renderer.clear();
	renderer.render(finalScene, camera);
	

	requestAnimationFrame(start);
}

function drawLine(context, start, end, color, width) {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(start[0], start[1])
    context.lineTo(end[0], end[1])
    context.stroke();
}

export function toLocalX(worldX) {
    return (worldX + 80) / ratioWidth;
}
export function toLocalY(worldY) {
	return (worldHeight + ((worldY + 60) * -1)) / ratioHeight;
}

export function toSmallLocalX(worldX) {
    return (worldX + 80);
}
export function toSmallLocalY(worldY) {
    return (worldHeight + ((worldY + 60) * -1));
}

export function toCustomLocalX(worldX, localWidth) {
	const ratio = worldWidth / localWidth;
    return (worldX + 80) / ratio;
}
export function toCustomLocalY(worldY, localHeight) {
	const ratio = worldHeight / localHeight;
    return (worldHeight + ((worldY + 60) * -1)) / ratio;
}

export function toWorldX(localX) {
	return (localX * ratioWidth) - (worldWidth / 2);
}
export function toWorldY(localX) {
    return (worldHeight / 2) - (localX * ratioHeight);
}


export function drawRotatedImage(context, image, angle, posX, posY, destW, destH) {
	// const x = destWidth / 2;
	// const y = destHeight / 2;
	const width = image.width;
	const height = image.height;

	context.translate(posX, posY);
	context.rotate(angle);
	context.drawImage(image, 0, 0, width, height, -destW / 2, -destH / 2, destW, destH);
	context.rotate(-angle);
	context.translate(-posX, -posY);
}

function buildBufferLightMesh(width, height) {
	const geometry = buildRectangleGeometry(width, height);

	const material = new MeshBasicMaterial({opacity: 1, color: 0x000000, transparent: true});

	return new Mesh(geometry, material);
}


function buildFinalMesh(width, height) {
	const geometry = buildRectangleGeometry(width, height);
	
	const materialTest = new MeshBasicMaterial({opacity: 1, map: fogOutput.texture, transparent: true});

	const uniforms = {
		bgMap: { type: "t", value: renderTargetGame.texture},
		// lightMap: { type: "t", value: renderTargetLight.texture},
		lightMap: { type: "t", value: canvasTextureLights},
		fogMap: { type: "t", value: fogOutput.texture},
	}

	const material = new ShaderMaterial({
		uniforms: uniforms,
		fragmentShader: LightingShader.fragment,
		vertexShader: LightingShader.vertex,
		transparent: true,
	});
	
	return new Mesh(geometry, material);
}

function buildFogMesh(width, height) {
	const geometry = buildRectangleGeometry(width, height);

	const uniforms = {
		// emiterPos: { type: "t", value: new Vector2(0, 0)},
		emiterPos: { type: "t", value: new Vector2(80, 40)},
		// fogMap: { type: "t", value: TextureLoader.get('fogTest')},
		time: { type: "t", value: 0},
		rand: { type: "t", value: 0},
		fogMap: { type: "t", value: fogInput.texture},
		// fluxMap: { type: "t", value: TextureLoader.get('fogFlux')},
		fluxMap: { type: "t", value: canvasTexture},
	}

	const material = new ShaderMaterial({
		uniforms: uniforms,
		fragmentShader: FogShader.fragment,
		vertexShader: FogShader.vertex,
		transparent: true,
	});
	

	return new Mesh(geometry, material);
}

export function buildRectangleGeometry(width, height) {
	const geometry = new BufferGeometry();
		
	const vertices = new Float32Array([
		-0.5 * width, -0.5 * height, 0,
		0.5 * width, -0.5 * height, 0,
		0.5 * width, 0.5 * height, 0,
		-0.5 * width, 0.5 * height, 0,
	]);
	
	const indices = [
		0, 1, 2,
		2, 3, 0,
	];

	geometry.setIndex(indices);
	geometry.setAttribute('position', new BufferAttribute(vertices, 3));

	geometry.setAttribute('uv', new BufferAttribute(new Float32Array([
		0, 0,
		1, 0,
		1, 1,
		0, 1,
	]), 2));
	
	return geometry;
}