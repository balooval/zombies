import * as Renderer from './renderer.js';
import * as TextureLoader from './net/loaderTexture.js';
import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshBasicMaterial,
	ShaderMaterial,
} from '../vendor/three.module.js';
import * as LightingShader from './shaders/lighting.js';


class Light {

    constructor(size) {
		this.width = size;
		this.height = size;
		this.buildMesh(this.width, this.height);
		this.depthPosition = 15;
		this.display();
	}

	display() {
		Renderer.lightScene.add(this.mesh);
	}
	
	hide() {
		Renderer.lightScene.remove(this.mesh);
	}

	setPosition(x, y) {
		this.mesh.position.set(x, y, this.depthPosition);
	}
	
	buildMesh(width, height) {
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

        const lightMaterial = new MeshBasicMaterial({opacity: 1, map: TextureLoader.get('light'), transparent: true});
		this.mesh = new Mesh(this.geometry, lightMaterial);
	}

	dispose() {
        this.geometry.dispose();
        this.mesh.material.dispose();
		this.hide();
	}
}

export {Light as default};