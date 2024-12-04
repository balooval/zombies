import * as Renderer from './renderer.js';
import * as TextureLoader from './net/loaderTexture.js';

import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshBasicMaterial,
} from '../vendor/three.module.js';

function getFogMaterial(textureId) {

	return new MeshBasicMaterial({
		opacity: 1,
		map: TextureLoader.get(textureId),
		transparent: true,
		blending: AdditiveBlending,
	});
}

export class FogEmiter {
    constructor(x, y) {
		this.width = 10;
		this.height = 10;
		this.buildMesh(this.width, this.height, 'fogEmiter');
		this.depthPosition = 12;
		this.setPosition(x, y);
		Renderer.fogScene.add(this.mesh);
	}

	setPosition(x, y) {
		this.mesh.position.set(x, y, this.depthPosition);
	}
	
	buildMesh(width, height, textureId) {
		this.geometry = new BufferGeometry();
		
		const vertices = new Float32Array( [
			-0.5 * width, -0.5 * height, 0,
			0.5 * width, -0.5 * height, 0,
			0.5 * width, 0.5 * height, 0,
			-0.5 * width, 0.5 * height, 0,
		] );
		
		const indices = [
			0, 1, 2,
			2, 3, 0,
		];

		this.geometry.setIndex(indices);
		this.geometry.setAttribute('position', new BufferAttribute(vertices, 3));

        this.geometry.setAttribute('uv', new BufferAttribute(new Float32Array([
			0, 0,
			1, 0,
			1, 1,
			0, 1,
		]), 2));

        const lightMaterial = getFogMaterial(textureId);
		this.mesh = new Mesh(this.geometry, lightMaterial);
	}

	dispose() {
        this.geometry.dispose();
        this.mesh.material.dispose();
	}
}
