import * as MATH from './utils/math.js';
import * as Renderer from './renderer.js';
import * as Stepper from './utils/stepper.js';
import * as TextureLoader from './net/loaderTexture.js';

import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshBasicMaterial,
	ShaderMaterial,
	Vector3,
} from '../vendor/three.module.js';

function getLightMaterial(textureId) {

	return new MeshBasicMaterial({
		opacity: 1,
		map: TextureLoader.get(textureId),
		transparent: true,
		blending: AdditiveBlending,
	});
}

class Light {
    constructor(x, y, width, height, textureId) {
		this.width = width;
		this.height = height;
		this.buildMesh(this.width, this.height, textureId);
		this.depthPosition = 15;
		this.setPosition(x, y);
		this.isOn = false;
	}

	turnOn() {
		this.isOn = true;
		Renderer.lightScene.add(this.mesh);
	}
	
	turnOff() {
		this.isOn = false;
		Renderer.lightScene.remove(this.mesh);
	}

	setPosition(x, y) {
		this.mesh.position.set(x, y, this.depthPosition);
	}
	
	buildMesh(width, height, textureId) {
		this.geometry = Renderer.buildRectangleGeometry(width, height)
        const lightMaterial = getLightMaterial(textureId);
		this.mesh = new Mesh(this.geometry, lightMaterial);
	}

	dispose() {
		this.turnOff();
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

        const lightMaterial = getLightMaterial(textureId);
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
		this.blinkStep = 0;
	}
	
	turnOff() {
		super.turnOff();
		Stepper.stopListenStep(this.blinkStep, this, this.blinkOff);
		Stepper.stopListenStep(this.blinkStep, this, this.blinkOn);
	}
	
	turnOn() {
		super.turnOn();

		this.blinkStep = Stepper.curStep + this.getNextStepBlink();
		this.blinkOn();
	}


	blinkOff() {
		Stepper.stopListenStep(this.blinkStep, this, this.blinkOff);
		Renderer.lightScene.remove(this.mesh);
		this.blinkStep = Stepper.curStep + 2;
		Stepper.listenStep(this.blinkStep, this, this.blinkOn);
	}
	
	blinkOn() {
		Stepper.stopListenStep(this.blinkStep, this, this.blinkOn);
		Renderer.lightScene.add(this.mesh);
		this.blinkStep = Stepper.curStep + this.getNextStepBlink();
		Stepper.listenStep(this.blinkStep, this, this.blinkOff);
	}

	getNextStepBlink() {
		return MATH.randomFloat(8, 100);
	}
}
