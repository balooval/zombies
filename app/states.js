import * as SpriteFactory from './spriteFactory.js';
import Hitbox from './collisionHitbox.js';
import * as Stepper from './utils/stepper.js';
import {
	TweenValue,
	TWEEN_END_EVENT,
} from './utils/tween.js';

export class State {
	constructor(position) {
		this.id = 'NONE';
		this.entity = null;
		this.position = position;
		this.hitBox = new Hitbox(-1, 1, -1, 1, true);
		this.sprite = SpriteFactory.createDummySprite();
	}
	
	setEntity(entity) {
		this.entity = entity
	}

	setSprite(width, height, animationId) {
		this.sprite = SpriteFactory.createAnimatedSprite(width, height, animationId);
		this.sprite.setPosition(this.position.x, this.position.y);
	}

	start() {}
	
	suspend() {}

	update(step, time) {
		this.sprite.setPosition(this.position.x, this.position.y);
	}

	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x, this.position.y);
	}

	dispose() {
		this.sprite.dispose();
		this.hitBox.dispose();
	}
}

export class StateFollowEntitie extends State {
	constructor(position, entitieToReach, moveSpeed) {
		super(position);
		this.moveSpeed = moveSpeed;
		this.entitieToReach = entitieToReach;
		this.distanceFromTargetX = 99999;
		this.distanceFromTargetY = 99999;
		this.distanceFromTargetTotal = 99999;
		this.angle = 0;
		this.updateDirectionRate = 30;
		this.sprite = SpriteFactory.createDummySprite();
	}

	start() {
		this.#updateDirection(0);
		super.start();
	}

	#updateDirection(step) {
		this.distanceFromTargetX = this.entitieToReach.position.x - this.position.x;
		this.distanceFromTargetY = this.entitieToReach.position.y - this.position.y;
		this.angle = Math.atan2(this.distanceFromTargetY, this.distanceFromTargetX);

		Stepper.stopListenStep(step, this, this.#updateDirection);
		Stepper.listenStep(Stepper.curStep + this.updateDirectionRate, this, this.#updateDirection);
	}

	update(step, time) {
		this.#move();
		super.update(step, time);
	}
	
	#move() {
		const transationX = Math.cos(this.angle);
		const transationY = Math.sin(this.angle);
		this.position.x += transationX * this.moveSpeed; 
		this.position.y += transationY * this.moveSpeed; 

		this.distanceFromTargetTotal = Math.abs(this.distanceFromTargetX) + Math.abs(this.distanceFromTargetY);

		if (this.distanceFromTargetTotal < 10) {
			this.onReachDestination();
		}
	}

	onReachDestination() {
		
	}

	dispose() {
		super.dispose();
	}
}


export class StateSlide extends State {
	constructor(position, velocityX, velocityY, friction) {
		super(position);
		this.velocityX = 0;
		this.velocityY = 0;
		this.friction = 0;
		this.sprite = SpriteFactory.createDummySprite();
	}

	start(params) {
		this.velocityX = params.velocityX;
		this.velocityY = params.velocityY;
		this.friction = params.friction;
		super.start();
	}

	update(step, time) {
		this.#move();
		super.update(time);
	}
	
	#move() {
		this.position.x += this.velocityX; 
		this.position.y += this.velocityY; 

		this.velocityX *= this.friction;
		this.velocityY *= this.friction;

		const translation = Math.abs(this.velocityX) + Math.abs(this.velocityY);

		if (translation < 0.001) {
			this.onStop();
		}
	}

	onStop() {
		
	}

	dispose() {
		super.dispose();
	}
}