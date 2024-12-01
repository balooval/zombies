import * as MATH from './utils/math.js';
import * as Renderer from './renderer.js';
import * as Stepper from './utils/stepper.js';
import * as TextureLoader from './net/loaderTexture.js';

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshBasicMaterial,
	Vector3,
} from '../vendor/three.module.js';

class Light {
    constructor(x, y, width, height, textureId) {
		this.width = width;
		this.height = height;
		this.buildMesh(this.width, this.height, textureId);
		this.depthPosition = 15;
		this.setPosition(x, y);
		this.isOn = false;
	}

	display() {
		this.isOn = true;
		Renderer.lightScene.add(this.mesh);
	}
	
	hide() {
		this.isOn = false;
		Renderer.lightScene.remove(this.mesh);
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

        const lightMaterial = new MeshBasicMaterial({opacity: 1, map: TextureLoader.get(textureId), transparent: true});
		this.mesh = new Mesh(this.geometry, lightMaterial);
	}

	dispose() {
		this.hide();
        this.geometry.dispose();
        this.mesh.material.dispose();
	}
}

export class PointLight extends Light {
    constructor(size, x, y) {
		super(x, y, size, size, 'light');
	}
}

export class SpotLight extends Light {
    constructor(x, y, width, height) {
		super(x, y, width, height, 'lightSpot');
		this.angle = 0;
	}

	setRotation(angle) {
		this.angle = angle;
		const vector = new Vector3(0, 0, 1);
		this.mesh.setRotationFromAxisAngle(vector, this.angle);
	}

	buildMesh(width, height, textureId) {
		this.geometry = new BufferGeometry();
		
		const vertices = new Float32Array( [
			0, -0.5 * height, 0,
			width, -0.5 * height, 0,
			width, 0.5 * height, 0,
			0, 0.5 * height, 0,
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

        const lightMaterial = new MeshBasicMaterial({opacity: 1, map: TextureLoader.get(textureId), transparent: true});
		this.mesh = new Mesh(this.geometry, lightMaterial);
	}
}

export class RectLight extends Light {
    constructor(x, y, width, height) {
		super(x, y, width, height, 'lightRect');
	}
}

// TODO: à fixer, elle se rallume tout seule après un blink
export class BlinkRectLight extends Light {
    constructor(x, y, width, height) {
		super(x, y, width, height, 'lightRect');
	}
	
	hide() {
		super.hide();
		Stepper.stopListenStep(Stepper.curStep, this, this.hide);
		Stepper.listenStep(Stepper.curStep + 2, this, this.display);
	}
	
	display() {
		super.display();
		Stepper.stopListenStep(Stepper.curStep, this, this.display);
		Stepper.listenStep(Stepper.curStep + this.getNextStepBlink(), this, this.hide);
	}

	getNextStepBlink() {
		return MATH.randomFloat(8, 100);
	}
}
