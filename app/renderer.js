import {
	OrthographicCamera,
	Scene,
	Vector3,
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
	console.log('ratioWidth', ratioWidth);
	console.log('ratioHeight', ratioHeight);
} 

export function start() {
	renderer.setRenderTarget(null);
	renderer.setClearColor(0x2a2958, 1);
	renderer.clear();
	renderer.render(scene, camera);
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