import * as MATH from './utils/math.js';
import * as SpriteFactory from './spriteFactory.js';

import {
	PLAYER_MAX_POS_X,
	PLAYER_MAX_POS_Y,
	PLAYER_MIN_POS_X,
	PLAYER_MIN_POS_Y,
} from './map/map.js';

import Hitbox from './collisionHitbox.js';
import Translation from './translation.js';
import { getIntersection } from './intersectionResolver.js';

export class State {
	constructor(position) {
		this.entity = null;
		this.position = position;
		this.hitBox = new Hitbox(-1, 1, -1, 1, true);
		this.sprite = SpriteFactory.createDummySprite();
		this.sprite.hide();
	}
	
	setEntity(entity) {
		this.entity = entity
	}
	
	setSprite(width, height, animationId) {
		this.sprite = SpriteFactory.createAnimatedSprite(width, height, animationId);
		this.sprite.setPosition(this.position.x, this.position.y);
		this.sprite.hide();
	}

	setHitBox(hitbox) {
		this.hitBox.dispose();
		this.hitBox = hitbox;
	}

	start() {
		this.sprite.setPosition(this.position.x, this.position.y);
		this.sprite.display();
	}
	
	suspend() {
		this.sprite.hide();
	}

	update(step, time) {
		this.sprite.setPosition(this.position.x, this.position.y);
	}

	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x, this.position.y);
	}

	removeSpriteLayer(name) {
		
	}

	dispose() {
		this.sprite.dispose();
		this.hitBox.dispose();
	}
}

export class StateSlide extends State {
	constructor(position, map) {
		super(position);
		this.map = map;
		this.velocityX = 0;
		this.velocityY = 0;
		this.friction = 0;
		this.translation = new Translation();
	}

	start(params) {
		this.slide(params);
		super.start(params);
	}

	slide(params) {
		this.velocityX = params.velocityX;
		this.velocityY = params.velocityY;
		this.friction = params.friction;
		this.moveSpeed = MATH.distance({x: 0, y: 0}, {x: this.velocityX, y: this.velocityY});

		const angle = Math.atan2(this.velocityY, this.velocityX)
		this.directionX = Math.cos(angle);
		this.directionY = Math.sin(angle);

		this.sprite.setRotation(angle);
	}

	update(step, time) {
		this.#updateTranslation();
		this.#move();
		super.update(time);
	}

	#updateTranslation() {
		if (this.velocityX === 0 && this.velocityY === 0) {
			this.translation.update(
				this.position.x,
				this.position.y,
				this.position.x,
				this.position.y,
			);
			return;
		}

		this.translation.setDirection(
			this.position.x,
			this.position.y,
			this.directionX,
			this.directionY,
			this.moveSpeed
		);
	}
	
	#move() {
		const wallHit = this.map.blocks.map(block => getIntersection(this.translation, block.hitBox)).filter(res => res).pop();

		let newPosX = this.position.x + this.velocityX;
		let newPosY = this.position.y + this.velocityY;

		if (wallHit) {
			newPosX = this.position.x;
			newPosY = this.position.y;
		}

		this.position.x = newPosX;
		this.position.y = newPosY;

		this.position.x = Math.max(PLAYER_MIN_POS_X, Math.min(this.position.x, PLAYER_MAX_POS_X));
		this.position.y = Math.max(PLAYER_MIN_POS_Y, Math.min(this.position.y, PLAYER_MAX_POS_Y));

		this.velocityX *= this.friction;
		this.velocityY *= this.friction;

		const velocity = MATH.distance({x: 0, y: 0}, {x: this.velocityX, y: this.velocityY});

		if (velocity < 0.001) {
			this.onStop();
		}
	}

	onStop() {
		
	}
}