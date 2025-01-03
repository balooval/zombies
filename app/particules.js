import * as AnimationControl from './animationControl.js';
import * as MATH from './utils/math.js';
import * as SpriteFactory from './spriteFactory.js';

import {
	randomDiff,
	randomElement,
	randomFloat,
	randomValue,
} from './utils/math.js';

import {DISPOSE_EVENT} from './map/map.js';
import Interval from './utils/interval.js';
import {
	Vector2
} from '../vendor/three.module.js';
import {getCurrentMap} from './gameLevel.js';
import {randomDirection} from './utils/math.js';

export const BLOOD_WALK = 'BLOOD_WALK';
export const ENNEMI_HIT = 'ENNEMI_HIT';
export const BONUS_TAKE = 'BONUS_TAKE';
export const EGG_EXPLOSION = 'EGG_EXPLOSION';
export const WOLF_FALLING = 'WOLF_FALLING';
export const WOLF_FALLING_CLOUD = 'WOLF_FALLING_CLOUD';
export const RAY = 'RAY';


export function create(type, position, direction) {
	switch (type) {
		case EGG_EXPLOSION:
			createEggExplosion(position, direction);
		break;
		case WOLF_FALLING:
			createWolfFallingTrail(position);
		break;
		case BONUS_TAKE:
			createBonusTake(position);
		break;
		case ENNEMI_HIT:
			createEnnemiHit(position, direction);
		break;
		case BLOOD_WALK:
			createBloodWalk(position);
		break;
	}
}

export function createBloodSplat(position) {
	const count = 20;

	for (let i = 0; i < count; i ++) {
		const color = randomElement([0x9e1908, 0x880000, 0x5e1616]);
		// const color = randomElement([0x880000, 0x5e1616]);
		const velocityX = randomDirection(1.2);
		const velocityY = randomDirection(1.2);
		const particule = new Particule(
			position.x,
			position.y,
			velocityX,
			velocityY,
			30, // stepDuration
			0.95, // scaleDecrease
			0, // gravity
			0.96, // airResistance
			color,
			1, // scale
		);
	}
}

export function createRay(start, end) {
	const distance = MATH.distance(start, end);
	const countByUnite = 2;
	const count = distance * countByUnite;
	const stepX = (end.x - start.x) / count;
	const stepY = (end.y - start.y) / count;

	let stepDuration = 2;
	const velocity = 0.05;

	for (let i = 3; i < count; i ++) {
		stepDuration += 0.1;
		// const color = randomElement([0x9e1908, 0x880000, 0x5e1616]);
		const color = randomElement([0x606060, 0x808080]);
		const particule = new Particule(
			randomDiff(start.x + (stepX * i), 0.2),
			randomDiff(start.y + (stepY * i), 0.2),
			randomFloat(-velocity, velocity), // velocityX
			randomFloat(-velocity, velocity), // velocityY
			// randomDiff(stepDuration, 0.05), // stepDuration
			stepDuration, // stepDuration
			// 3, // stepDuration
			0.95, // scaleDecrease
			0, // gravity
			1, // airResistance
			color,
			0.5, // scale
			// randomValue(0.2, 0.4), // scale
		);
	}
}

function createBonusTake(position) {
	const baseRadius = 8;
	const count = 80;

	for (let i = 0; i < count; i ++) {
		const angle = randomDirection(3.14);
		const radius = randomValue(baseRadius * 8, baseRadius * 12) * 0.1;
		const velocity = randomValue(8, 18) * 0.1;
		const directionX = Math.cos(angle);
		const directionY = Math.sin(angle);
		const offsetX = directionX * radius;
		const offsetY = directionY * (radius * 0.5);

		const color = randomElement([0x55eb34, 0xffe600]);
		const velocityX = directionX * velocity;
		const velocityY = directionY * velocity;
		const particule = new Particule(
			position.x + offsetX,
			position.y + offsetY,
			velocityX + randomDirection(0.02),
			velocityY + randomDirection(0.02) + 0.2,
			50,
			0.98,
			0.002,
			0.95,
			color,
		);
	}
}

function createEnnemiHit(position, direction) {
	const count = 30;

	for (let i = 0; i < count; i ++) {
		const color = randomElement([0xff0000, 0x880000]);
		const angle = Math.atan2(direction.y, direction.x);
		const curAngle = randomDiff(angle, 0.5);
		const curDirX = Math.cos(curAngle);
		const curDirY = Math.sin(curAngle);
		const distance = Math.tan(randomFloat(0.1, 1.5));
		const particule = new Particule(
			position.x + curDirX * distance,
			position.y + curDirY * distance,
			0, // velocityX
			0, // velocityY
			60, // stepDuration
			0.99, // scaleDecrease
			0, // gravity
			1, // airResistance
			color,
			0.5, // scale
		);
	}
}

function createWolfFallingTrail(position) {
	const count = 1;

	for (let i = 0; i < count; i ++) {
		// const color = randomElement([0x731414, 0x000000]);
		const color = randomElement([0x202020, 0x101010]);
		// const color = 0x000000;
		const velocityX = randomDirection(0.05);
		const velocityY = 0;
		const particule = new Particule(
			position.x + randomDirection(1),
			position.y,
			velocityX,
			velocityY,
			60,
			0.99,
			-0.002,
			1,
			color,
		);
	}
}

function createEggExplosion(position, direction) {
	const count = 20;

	for (let i = 0; i < count; i ++) {
		const color = randomElement([0xf5e042, 0xffffff]);
		const velocityX = randomDirection(2) + direction.x;
		const velocityY = randomDirection(2) + direction.y;
		const particule = new Particule(
			position.x,
			position.y,
			velocityX,
			velocityY,
			30,
			0.95,
			0.04,
			0.96,
			color,
		);
	}
}

function createBloodWalk(position) {
	const count = 10;

	for (let i = 0; i < count; i ++) {
		// const color = randomElement([0x9e1908, 0x880000, 0x5e1616]);
		const color = randomElement([0x880000, 0x5e1616]);
		const particule = new Particule(
			randomDiff(position.x, 2),
			randomDiff(position.y, 2),
			0, // velocityX
			0, // velocityY
			randomValue(300, 400), // stepDuration
			1, // scaleDecrease
			0, // gravity
			1, // airResistance
			color,
			randomValue(0.4, 0.6), // scale
		);
	}
}

class Particule {
	constructor(posX, posY, velocityX, velocityY, stepDuration, scaleDecrease, gravity, airResistance, color, scale) {
		this.map = getCurrentMap();
		this.gravity = gravity;
		this.airResistance = airResistance;
		this.velX = velocityX;
		this.velY = velocityY;
		this.scale = scale ?? 1;
		this.scaleDecrease = scaleDecrease;
		this.position = new Vector2(posX, posY);
		AnimationControl.registerToUpdate(this);
		
		this.sprite = SpriteFactory.createFlatSprite(this.position.x, this.position.y, color);
		this.sprite.setScale(this.scale);

		this.shootInterval = new Interval(stepDuration, () => this.dispose(), false);
		this.shootInterval.start();
		this.map.evt.addEventListener(DISPOSE_EVENT, this, this.dispose);
	}

	move() {
		this.velX *= this.airResistance;
		this.velY *= this.airResistance;
		this.velY -= this.gravity;
		this.position.x += this.velX;
		this.position.y += this.velY;
		this.sprite.setPosition(this.position.x, this.position.y, 12);

		this.scale *= this.scaleDecrease;
		this.sprite.setScale(this.scale);
	}
	
	update(step, time) {
		this.move(time);
	}

	dispose() {
		this.map.evt.removeEventListener(DISPOSE_EVENT, this, this.dispose);
		AnimationControl.unregisterToUpdate(this);
		this.sprite.dispose();
		this.shootInterval.dispose();
	}
}