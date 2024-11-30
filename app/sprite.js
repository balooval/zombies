import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshBasicMaterial,
	ShaderMaterial,
	Vector2,
	Vector3
} from '../vendor/three.module.js';
import * as Renderer from './renderer.js';
import * as TextureLoader from './net/loaderTexture.js';
import {TextureAnimation} from './textureAnimation.js';
import * as LightingShader from './shaders/lighting.js';

const materials = new Map();

function getSpriteMaterial(animationId) {
	if (materials.has(animationId)) {
		return materials.get(animationId);
	}
	
	// const material = new MeshBasicMaterial({opacity: 1, map: TextureLoader.get(animationId), transparent: true});

	const texture = TextureLoader.get(animationId);

	const uniforms = {
		lightPosition: {value: new Vector2(0, 0)},
		map: { type: "t", value: texture},
		lights: {
			value: Renderer.lights
		}
	}

	const material = new ShaderMaterial({
		uniforms: uniforms,
		fragmentShader: LightingShader.fragment,
		vertexShader: LightingShader.vertex,
		transparent: true,
	})


	materials.set(animationId, material);
	return material;
}

export class SpriteBase {

	constructor() {
		this.width = 1;
		this.height = 1;
		this.angle = 0;
	}

	getPosition() {
		return null;
	}

	display() {
	}

	hide() {
	}

	setPosition(x, y) {}

	setOpacity(opacity) {}
	
	setDepth(depthPosition) {}

	setRotation(angle) {
		this.angle = angle;
	}

	getRotation() {
		return this.angle;
	}

	flipHorizontal() {}

	changeAnimation(animationId) {}

	dispose() {}
}

export class AnimatedSprite extends SpriteBase {

	constructor(render, width, height, animationId) {
		super();
		this.width = width;
		this.height = height;
		this.buildMesh(width, height, animationId);
		this.render = render;
		this.textureAnimation = new TextureAnimation(this.mesh, animationId);
		this.depthPosition = 5;
		this.animationOffsetV = this.textureAnimation.getOffsetV() * this.height;
		this.display();
	}

	display() {
		this.render.scene.add(this.mesh);
		super.display();
	}
	
	hide() {
		this.render.scene.remove(this.mesh);
		super.hide();
	}

	getPosition() {
		return this.mesh.position;
	}

	setPosition(x, y) {
		this.mesh.position.set(x, y - this.animationOffsetV, this.depthPosition);
	}

	setRotation(angle) {
		super.setRotation(angle);
		const vector = new Vector3(0, 0, 1);
		this.mesh.setRotationFromAxisAngle(vector, this.angle);
	}

	setOpacity(opacity) {
		this.mesh.material.opacity = opacity;
	}
	
	setDepth(depthPosition) {
		this.depthPosition = depthPosition;
		this.mesh.position.z = this.depthPosition;
	}

	flipHorizontal() {
		this.textureAnimation.flipHorizontal();
	}

	changeAnimation(animationId) {
		this.textureAnimation.setAnimation(animationId);
		this.animationOffsetV = this.textureAnimation.getOffsetV() * this.height;
	}
	
	buildMesh(width, height, animationId) {
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

		const material = getSpriteMaterial(animationId);
		
		this.mesh = new Mesh(this.geometry, material);
	}

	dispose() {
		this.hide();
		this.textureAnimation.dispose();
	}
}

export class FlatRectangleSprite {

	constructor(render, x, y, width, height, color) {
		this.mesh = new Mesh(buildFlatMesh(width, height), getColorMaterial(color));
		this.render = render;
		this.depthPosition = 1;
		this.mesh.material = getColorMaterial(color);
		this.display();
		this.setPosition(x, y);
	}

	getPosition() {
		return this.mesh.position;
	}

	setPosition(x, y) {
		this.mesh.position.set(x, y, this.depthPosition);
	}

	display() {
		this.render.scene.add(this.mesh);
	}

	hide() {
		this.render.scene.remove(this.mesh);
	}
	
	dispose() {
		this.hide();
	}
}

export class FlatSprite {

	constructor(render, x, y, color) {
		this.mesh = new Mesh(flatGeometry, getColorMaterial(color));
		this.render = render;
		this.depthPosition = 1;
		this.reset(x, y, color);
	}
	
	reset(x, y, color) {
		this.isAlive = true;
		this.mesh.material = getColorMaterial(color);
		this.display();
		this.setPosition(x, y);
		this.setScale(1);
	}

	getPosition() {
		return this.mesh.position;
	}

	setPosition(x, y) {
		this.mesh.position.set(x, y, this.depthPosition);
	}
	
	setScale(scale) {
		this.mesh.scale.x = scale;
		this.mesh.scale.y = scale;
		this.mesh.scale.z = scale;
	}

	display() {
		this.render.scene.add(this.mesh);
	}

	hide() {
		this.render.scene.remove(this.mesh);
	}
	
	dispose() {
		this.hide();
		this.isAlive = false;
	}
}

let flatGeometry = buildFlatMesh(1, 1);
const colorMaterials = new Map();

// 0xf5e042

function getColorMaterial(color) {
	if (colorMaterials.has(color) === true) {
		return colorMaterials.get(color);
	}

	const material = new MeshBasicMaterial({color:color});
	colorMaterials.set(color, material);

	return material;
}

function buildFlatMesh(width, height) {
	const geometry = new BufferGeometry();
	
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

	geometry.setIndex(indices);
	geometry.setAttribute('position', new BufferAttribute(vertices, 3));
	
	return geometry;
}