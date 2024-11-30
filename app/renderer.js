import {
	BufferAttribute,
	BufferGeometry,
	LinearFilter,
	Mesh,
	MeshBasicMaterial,
	NearestFilter,
	OrthographicCamera,
	Scene,
	ShaderMaterial,
	Vector2,
	Vector3,
	WebGLRenderer,
	WebGLRenderTarget,
	BoxGeometry,
	PlaneGeometry,

} from '../vendor/three.module.js';


import * as PostProcess from './shaders/postProcess.js';

export let renderer;
export let camera;

export let controls;
export let scene = null;
export const worldWidth = 160;
export const worldHeight = 120;

const ratio = 4 / 3;
let ratioWidth = 1;
let ratioHeight = 1;

let bufferScene;
let bufferTarget;

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

	bufferTarget = new WebGLRenderTarget(mainElmt.clientWidth, mainElmt.clientWidth / ratio, { minFilter: LinearFilter, magFilter: NearestFilter});
	const bufferMesh = buildBufferMesh(worldWidth, worldHeight);
	bufferScene = new Scene();
	bufferScene.add(bufferMesh);
} 

export function start() {
	// renderer.setRenderTarget(null);
	// renderer.setClearColor(0x2a2958, 1);
	// renderer.clear();
	// renderer.render(scene, camera);
	
	renderer.setRenderTarget(bufferTarget)
	renderer.setClearColor(0x2a2958, 1);
	renderer.clear();
	renderer.render(scene, camera);
	
	renderer.setRenderTarget(null);
	renderer.setClearColor(0xff0000, 1);
	renderer.clear();
	renderer.render(bufferScene, camera);


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

function buildBufferMesh(width, height) {
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


	
	const lights = new Float32Array([
		-40, -20,
		30, 20
	]);
	geometry.setAttribute('lights', new BufferAttribute(lights, 2));

	geometry.setAttribute('uv', new BufferAttribute(new Float32Array([
		0, 0,
		1, 0,
		1, 1,
		0, 1,
	]), 2));


	const uniforms = {
		map: { type: "t", value: bufferTarget.texture},
	}

	const material = new ShaderMaterial({
		uniforms: uniforms,
		fragmentShader: PostProcess.fragment,
		vertexShader: PostProcess.vertex,
		transparent: true,
	})

	console.log('geometry', geometry);
	
	return new Mesh(geometry, material);
}