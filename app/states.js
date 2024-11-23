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

	update(time) {
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

export class StateReachEntitie extends State {
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

	update(time) {
		this.#move();
		super.update(time);
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
		this.dispose();
	}

	dispose() {
		super.dispose();
	}
}
