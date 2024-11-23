import {
	Vector2
} from '../vendor/three.module.js';
import * as AnimationControl from './animationControl.js';
import * as SpriteFactory from './spriteFactory.js';
import {randomDirection} from './utils/math.js';
import {
	randomElement,
	randomValue,
} from './utils/misc.js';
import Interval from './utils/interval.js';

export const BONUS_TAKE = 'BONUS_TAKE';
export const EGG_EXPLOSION = 'EGG_EXPLOSION';
export const WOLF_FALLING = 'WOLF_FALLING';
export const WOLF_FALLING_CLOUD = 'WOLF_FALLING_CLOUD';

export class WolfFallingParticules {
	constructor(entitie) {
		this.entitie = entitie;
		this.lastPosition = this.entitie.position.clone();
		this.interval = new Interval(15, () => this.update(), true);
		this.interval.start();
	}

	update() {
		const speed = 20 - (this.lastPosition.distanceTo(this.entitie.position));
		const radius = Math.max(1, speed / 8);
		const count = Math.max(8, speed * 4);
		createWolfCloud(this.entitie.position, radius, count);
		this.lastPosition.copy(this.entitie.position);
    }

	dispose() {
		this.interval.dispose();
	}
}


export class EggWallParticules {
	constructor(entitie) {
		this.entitie = entitie;
		this.count = 10;
		this.interval = new Interval(3, () => this.update(), true);
		this.interval.start();
	}

	update() {
		this.count = Math.max(1, this.count * 0.9);
		for (let i = 0; i < this.count; i ++) {
			const color = randomElement([0xf5e042, 0xd9b336]);
			const particule = new Particule(
				this.entitie.position.x + randomDirection(this.count / 4),
				this.entitie.position.y +  + randomDirection(this.count / 4),
				0,
				0,
				115 + randomDirection(20),
				0.99,
				0,
				1,
				color,
			);
		}
    }

	dispose() {
		this.interval.dispose();
	}
}



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

function createWolfCloud(position, radius, count) {

	for (let i = 0; i < count; i ++) {
		const angle = randomDirection(3.14);
		const offsetX = Math.cos(angle) * radius;
		const offsetY = Math.sin(angle) * (radius * 0.5);

		const color = randomElement([0x48526b, 0x384052]);
		const velocityX = offsetX * 0.01;
		const velocityY = offsetY * 0.01;
		const particule = new Particule(
			position.x + offsetX,
			position.y + offsetY,
			velocityX + randomDirection(0.02),
			velocityY + randomDirection(0.02) + 0.2,
			50,
			0.98,
			0.002,
			0.9,
			color,
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

class Particule {
	constructor(posX, posY, velocityX, velocityY, stepDuration, scaleDecrease, gravity, airResistance, color) {
		this.gravity = gravity;
		this.airResistance = airResistance;
		this.velX = velocityX;
		this.velY = velocityY;
		this.scale = 1;
		this.scaleDecrease = scaleDecrease;
		this.position = new Vector2(posX, posY);
		AnimationControl.registerToUpdate(this);
		
		this.sprite = SpriteFactory.createFlatSprite(this.position.x, this.position.y, color);

		this.shootInterval = new Interval(stepDuration, () => this.dispose(), false);
		this.shootInterval.start();
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
		AnimationControl.unregisterToUpdate(this);
		this.sprite.dispose();
		this.shootInterval.dispose();
	}
}