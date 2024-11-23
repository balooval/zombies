import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshBasicMaterial
} from '../vendor/three.module.js';
import * as Renderer from './renderer.js';

class HitboxDebug {

	constructor(left, right, bottom, top) {
		const width = right - left;
		const height = top - bottom;
		this.buildMesh(left, right, bottom, top);
		const posX = left + (width / 2);
		const posY = bottom + (height / 2);
		this.setPosition(posX, posY);
		Renderer.scene.add(this.mesh);
	}

	setPosition(x, y) {
		this.mesh.position.set(x, y, 30);
	}
	
	buildMesh(left, right, bottom, top) {
		this.geometry = new BufferGeometry();

		const vertices = new Float32Array( [
			left, bottom, 0,
			right, bottom, 0,
			right, top, 0,
			left, top, 0,
		] );

		const indices = [
			0, 1, 2,
			2, 3, 0,
		];

		this.geometry.setIndex(indices);
		this.geometry.setAttribute('position', new BufferAttribute(vertices, 3));
		this.geometry.computeBoundingBox();
		this.geometry.computeBoundingSphere();

		const material = new MeshBasicMaterial({color:0x00ff00, transparent: true, opacity: 0.2});
		this.mesh = new Mesh(this.geometry, material);
	}

	dispose() {
		Renderer.scene.remove(this.mesh);
	}
}

export {HitboxDebug as default};