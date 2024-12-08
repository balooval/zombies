import * as Renderer from './renderer.js';
import * as TextureLoader from './net/loaderTexture.js';

import {
	AdditiveBlending,
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
		this.width = 5;
		this.height = 5;
		this.buildMesh(this.width, this.height, 'fogEmiter');
		this.depthPosition = 12;
		this.setPosition(x, y);
		Renderer.fogScene.add(this.mesh);
	}

	setPosition(x, y) {
		this.mesh.position.set(x, y, this.depthPosition);
	}
	
	buildMesh(width, height, textureId) {
		this.geometry = Renderer.buildRectangleGeometry(width, height);
        const lightMaterial = getFogMaterial(textureId);
		this.mesh = new Mesh(this.geometry, lightMaterial);
	}

	dispose() {
        this.geometry.dispose();
        this.mesh.material.dispose();
	}
}
