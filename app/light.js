import * as AnimationControl from './animationControl.js';
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

import LightCanvas from './lightCanvas.js';

const colorCanvas = new OffscreenCanvas(64, 64);
const colorContext = colorCanvas.getContext('2d');

class Light {
    constructor(x, y) {
		this.posX = x;
		this.posY = y;
		this.isOn = false;

		AnimationControl.registerToUpdate(this);
	}

	update() {
		if (this.isOn === false) {
			return;
		}

		this.draw();
	}

	draw() {

	}
	
	turnOn() {
		this.isOn = true;
	}
	
	turnOff() {
		this.isOn = false;
	}

	setPosition(x, y) {
		this.posX = x;
		this.posY = y;
	}

	dispose() {
		this.turnOff();
        AnimationControl.unregisterToUpdate(this);
	}
}

export class PointLight extends Light {
    constructor(size, x, y, color) {
		super(x, y);
		this.size = size;
		this.textureImage = TextureLoader.get('light').image;

		const colorCanvas = new OffscreenCanvas(64, 64);
		const colorContext = colorCanvas.getContext('2d');
		colorContext.clearRect(0, 0, 64, 64);
		colorContext.fillStyle = color;
		colorContext.fillRect(0, 0, 64, 64);
		colorContext.globalCompositeOperation = 'destination-in';
		colorContext.drawImage(this.textureImage, 0, 0);
		colorContext.globalCompositeOperation = 'source-over';

		createImageBitmap(colorCanvas).then(imageBitmap => this.#onImageReady(imageBitmap));
	}

	#onImageReady(imageBitmap) {
		this.textureImage = imageBitmap;
	}

	draw() {
		LightCanvas.drawPointLight(this);
	}
}

export class SpotLight extends Light {
    constructor(x, y, fov, color) {
		super(x, y);
		this.fovAngle = fov;
		this.color = color;
		this.angle = 0;
	}

	setRotation(angle) {
		this.angle = angle;
	}

	draw() {
		LightCanvas.drawSpotLight(this);
	}
}

export class RectLight extends Light {
    constructor(x, y, width, height) {
		super(x, y);
		this.width = width
		this.height = height;
		this.color = 'rgba(200, 200, 200)';
	}

	draw() {
		LightCanvas.drawRectLight(this);
	}
}

// TODO: à fixer, elle se rallume tout seule après un blink
export class BlinkRectLight extends RectLight {
    constructor(x, y, width, height) {
		super(x, y, width, height);
		this.blinkStep = 0;
		this.blinkState = false;
	}

	draw() {
		if (this.blinkState === true) {
			return;
		}
		super.draw();
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
		this.blinkState = true;
		this.blinkStep = Stepper.curStep + 2;
		Stepper.listenStep(this.blinkStep, this, this.blinkOn);
	}
	
	blinkOn() {
		Stepper.stopListenStep(this.blinkStep, this, this.blinkOn);
		this.blinkState = false;
		this.blinkStep = Stepper.curStep + this.getNextStepBlink();
		Stepper.listenStep(this.blinkStep, this, this.blinkOff);
	}

	getNextStepBlink() {
		return MATH.randomFloat(8, 100);
	}
}
