import * as SpriteFactory from './spriteFactory.js';
import Hitbox from './collisionHitbox.js';
import * as Stepper from './utils/stepper.js';
import {
	TweenValue,
	TWEEN_END_EVENT,
} from './utils/tween.js';
import * as Utils from './utils/misc.js';
import {
	PLAYER_MAX_POS_X,
	PLAYER_MIN_POS_X,
	PLAYER_MAX_POS_Y,
	PLAYER_MIN_POS_Y,
} from './map/map.js';

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

		this.sprite.setRotation(this.angle);

		const nextUpdateDirectionStepDelay = this.getNextUpdateDirectionStepDelay();
		Stepper.stopListenStep(step, this, this.#updateDirection);
		Stepper.listenStep(Stepper.curStep + nextUpdateDirectionStepDelay, this, this.#updateDirection);
	}

	getNextUpdateDirectionStepDelay() {
		return 1;	
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




export class StateTravelCells extends State {
	constructor(position, cellRoot, moveSpeed) {
		super(position);
		this.moveSpeed = moveSpeed;
		this.cellRoot = cellRoot;
		this.distanceFromTargetX = 99999;
		this.distanceFromTargetY = 99999;
		this.distanceFromTargetTotal = 99999;
		this.destX = 0;
		this.destY = 0;
		this.angle = 0;
		this.sprite = SpriteFactory.createDummySprite();
		this.travelPoints = [];
	}

	start() {
		this.travelPoints = [];
		this.#updateDirection();
		super.start();
	}

	#updateDirection() {

		if (this.travelPoints.length === 0) {
			const nextConnection = this.#getNextConnectionToReach();
			// console.log('nextConnection', nextConnection);
			
			this.travelPoints.push([
				nextConnection.point[0],
				nextConnection.point[1],
			]);
			this.travelPoints.push([
				nextConnection.cell.center.x,
				nextConnection.cell.center.y,
			]);
		}

		const pos = this.travelPoints.shift();
		this.destX = pos[0];
		this.destY = pos[1];

		this.distanceFromTargetX = this.destX - this.position.x;
		this.distanceFromTargetY = this.destY - this.position.y;
		this.angle = Math.atan2(this.distanceFromTargetY, this.distanceFromTargetX);
		this.sprite.setRotation(this.angle);
	}

	#getNextConnectionToReach() {
		const currentCell = this.cellRoot.getCellByPosition(this.position.x, this.position.y);
		const potentialConnections = currentCell.connections.filter(connection => connection.cell.blocks.length === 0);
		return Utils.randomElement(potentialConnections);
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
		
		this.distanceFromTargetX = this.destX - this.position.x;
		this.distanceFromTargetY = this.destY - this.position.y;
		this.distanceFromTargetTotal = Math.abs(this.distanceFromTargetX) + Math.abs(this.distanceFromTargetY);

		if (this.distanceFromTargetTotal < 10) {
			this.onReachDestination();
		}
	}

	onReachDestination() {
		// console.log('onReachDestination');
		this.#updateDirection();
	}

	dispose() {
		super.dispose();
	}
}


export class StateSlide extends State {
	constructor(position) {
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

		const angle = Math.atan2(this.velocityY, this.velocityX)
		this.sprite.setRotation(angle);
		super.start();
	}

	update(step, time) {
		this.#move();
		super.update(time);
	}
	
	#move() {
		this.position.x += this.velocityX;
		this.position.y += this.velocityY;

		this.position.x = Math.max(PLAYER_MIN_POS_X, Math.min(this.position.x, PLAYER_MAX_POS_X));
		this.position.y = Math.max(PLAYER_MIN_POS_Y, Math.min(this.position.y, PLAYER_MAX_POS_Y));

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