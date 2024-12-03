import * as FogShader from './shaders/fog.js';
import * as LightingShader from './shaders/applyLights.js';
import * as Mouse from './inputMouse.js';
import * as TextureLoader from './net/loaderTexture.js';

import {
	BoxGeometry,
	BufferAttribute,
	BufferGeometry,
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
export let renderTargetGame;
let renderTargetLight;

let fogInput;
let fogOutput;
let fogRenderA;
let fogRenderB;
let fogScene;
let fogMesh;
let bufferFinalMesh;
let time = 0;
let rand = 0;

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
	
	fogRenderA = new WebGLRenderTarget(worldWidth, worldHeight, { minFilter: LinearFilter, magFilter: LinearFilter});
	fogRenderB = new WebGLRenderTarget(worldWidth, worldHeight, { minFilter: LinearFilter, magFilter: LinearFilter});

	fogInput = fogRenderA;
	fogOutput = fogRenderB;
	fogScene = new Scene();
	fogMesh = buildFogMesh(worldWidth, worldHeight);
	fogScene.add(fogMesh);
	
	const bufferLightMesh = buildBufferLightMesh(worldWidth, worldHeight);
	lightScene = new Scene();
	lightScene.add(bufferLightMesh);
	
	bufferFinalMesh = buildBufferFinalMesh(worldWidth, worldHeight);
	finalScene = new Scene();
	finalScene.add(bufferFinalMesh);
} 

export function start() {
	// renderer.setRenderTarget(null);
	// renderer.setClearColor(0x2a2958, 1);
	// renderer.clear();
	// renderer.render(scene, camera);

	time ++;


	renderer.setRenderTarget(fogOutput)
	renderer.setClearColor(0x808080, 1);
	renderer.clear();
	renderer.render(fogScene, camera);
	
	renderer.setRenderTarget(null);
	renderer.setClearColor(0xff0000, 1);
	renderer.clear();
	renderer.render(finalScene, camera);

	const temp = fogInput
	fogInput = fogOutput;
	fogOutput = temp;

	rand = (Math.random() * 2) - 1;
	const randY = (Math.random() * 2) - 1;

	bufferFinalMesh.material.map = fogOutput.texture;
	fogMesh.material.uniforms.time.value = time;
	fogMesh.material.uniforms.rand.value = rand;
	fogMesh.material.uniforms.fogMap.value = fogInput.texture;
	fogMesh.material.uniforms.mouse.value = new Vector2(Mouse.worldPosition[0] + 80 + rand, Mouse.worldPosition[1] + 60 + randY);
	

	
	// renderer.setRenderTarget(renderTargetGame)
	// renderer.setClearColor(0x2a2958, 1);
	// renderer.clear();
	// renderer.render(scene, camera);

	// renderer.setRenderTarget(renderTargetLight)
	// renderer.setClearColor(0x808080, 1);
	// renderer.clear();
	// renderer.render(lightScene, camera);
	
	// renderer.setRenderTarget(null);
	// renderer.setClearColor(0xff0000, 1);
	// renderer.clear();
	// renderer.render(finalScene, camera);
	

	requestAnimationFrame(start);
}

export function toLocalX(worldX) {
    return (worldX + 80) / ratioWidth;
}

export function toLocalY(worldY) {
    return (worldHeight + ((worldY + 60) * -1)) / ratioHeight;
}

export function toWorldX(localX) {
	return (localX * ratioWidth) - (worldWidth / 2);
}
export function toWorldY(localX) {
    return (worldHeight / 2) - (localX * ratioHeight);
}

function buildBufferLightMesh(width, height) {
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

	const material = new MeshBasicMaterial({opacity: 1, color: 0x000000, transparent: true});

	return new Mesh(geometry, material);
}


function buildBufferFinalMesh(width, height) {
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

	// const uniforms = {
	// 	bgMap: { type: "t", value: renderTargetGame.texture},
	// 	lightMap: { type: "t", value: renderTargetLight.texture},
	// }

	// const material = new ShaderMaterial({
	// 	uniforms: uniforms,
	// 	fragmentShader: LightingShader.fragment,
	// 	vertexShader: LightingShader.vertex,
	// 	transparent: true,
	// });
	
	const materialTest = new MeshBasicMaterial({opacity: 1, map: fogOutput.texture, transparent: true});

	return new Mesh(geometry, materialTest);
}

function buildFogMesh(width, height) {
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

	const uniforms = {
		mouse: { type: "t", value: new Vector2(0, 0)},
		// fogMap: { type: "t", value: TextureLoader.get('fogTest')},
		time: { type: "t", value: 0},
		rand: { type: "t", value: 0},
		fogMap: { type: "t", value: fogInput.texture},
		fluxMap: { type: "t", value: TextureLoader.get('fogFlux')},
	}

	const material = new ShaderMaterial({
		uniforms: uniforms,
		fragmentShader: FogShader.fragment,
		vertexShader: FogShader.vertex,
		transparent: true,
	});
	

	return new Mesh(geometry, material);
}