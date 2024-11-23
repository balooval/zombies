import {
	Vector2
} from '../vendor/three.module.js';
import * as AnimationControl from './animationControl.js';
import CollisionResolver from './collisionResolver.js';
import Hitbox from './collisionHitbox.js';
import * as SpriteFactory from './spriteFactory.js';
import * as MATH from './utils/math.js';
import * as Stepper from './utils/stepper.js';
import * as Particules from './particules.js';
import {
	State,
	StateMoveOnX,
} from './states.js';
import {
	WOLF_TOUCH_GROUND_EVENT,
} from './map/map.js';
import EntityWithStates from './entityWithStates.js'
import { DoubleEggLauncher } from './weapons.js'

export function buildPoussinBonus(map, startPosition, leavePosition) {
	const states = new Map();
	states.set('ENTER', new PoussinStateEnter(startPosition, leavePosition.x, map));
	states.set('LAUNCH_BONUS', new PoussinStateLaunchBonus(leavePosition));
	states.set('LEAVE', new PoussinStateLeave(startPosition, startPosition.x));
	return new PoussinBonus(states);
}

class PoussinBonus extends EntityWithStates {
	constructor(states) {
		super(states);
	}
}

class PoussinStateLaunchBonus extends State {
	constructor(position) {
		super(position);
		this.id = 'LAUNCH_BONUS';
		this.launchStep = 0;
		this.exitStep = 0;
	}

	start() {
		this.setSprite(6, 6, 'poussinBonusWalk');
		super.start();
		this.launchStep = Stepper.curStep + 20;
		Stepper.listenStep(this.launchStep, this, this.launchBonus);
	}
	
	launchBonus(step) {
		Stepper.stopListenStep(step, this, this.launchBonus);
		const bonusAir = new BonusAir(this.position.x, this.position.y + 10, MATH.randomDirection(3), 3);
		this.exitStep = Stepper.curStep + 40;
		Stepper.listenStep(this.exitStep + 40, this, this.startToExit);
	}

	startToExit(step) {
		Stepper.stopListenStep(step, this, this.startToExit);
		this.dispose();
		this.entity.setState('LEAVE');
	}
	
	dispose() {
		Stepper.stopListenStep(this.launchStep, this, this.launchBonus);
		Stepper.stopListenStep(this.exitStep, this, this.startToExit);
		super.dispose();
	}
}

class PoussinStateEnter extends StateMoveOnX {
	constructor(position, destinationPosition, map) {
		super(position, destinationPosition, 40);
		this.id = 'ENTER';
		this.map = map;
	}

	start() {
		this.setSprite(6, 6, 'poussinBonusWalk');
		super.start();
		this.map.evt.addEventListener(WOLF_TOUCH_GROUND_EVENT, this, this.onWolfTouchGround);
	}
	
	onReachDestination() {
		super.onReachDestination();
		this.entity.setState('LAUNCH_BONUS');
	}

	onWolfTouchGround() {
		this.map.evt.removeEventListener(WOLF_TOUCH_GROUND_EVENT, this, this.onWolfTouchGround);
		this.entity.setState('LEAVE');
		this.dispose();
	}

	dispose() {
		this.map.evt.removeEventListener(WOLF_TOUCH_GROUND_EVENT, this, this.onWolfTouchGround);
		super.dispose();
	}
}

class PoussinStateLeave extends StateMoveOnX {
	constructor(position, destinationPosition) {
		super(position, destinationPosition, 20);
		this.id = 'LEAVE';
	}

	start() {
		this.setSprite(6, 6, 'poussinBonusWalk');
		this.sprite.flipHorizontal();
		super.start();
	}
	
	onReachDestination() {
		super.onReachDestination();
		this.entity.dispose();
	}
}

class BonusAir {

	constructor(posX, posY, velocityX, velocityY) {
		this.isFalling = false;
		this.gravity = 0.05;
		this.airResistance = 0.98;
		this.velX = velocityX;
		this.velY = velocityY;
		this.position = new Vector2(posX, posY);
		AnimationControl.registerToUpdate(this);
		this.hitBox = new Hitbox(-2, 2, -4, 0, true);
		CollisionResolver.checkCollisionWithLayer(this, 'MAP');
		CollisionResolver.checkCollisionWithLayer(this, 'WALLS');

		CollisionResolver.addToLayer(this, 'BONUS');

		this.sprite = SpriteFactory.createAnimatedSprite(8, 8, 'bonusFlying');
		this.sprite.setPosition(this.position.x, this.position.y);
	}

	take() {
		Particules.create(Particules.BONUS_TAKE, this.position);
		this.dispose();
		return new DoubleEggLauncher();
	}

	onCollide(collisions, layersName) {
		switch (layersName) {
			case 'WALLS':
				this.onCollideWall(collisions);
			break;

			case 'MAP':
				this.onCollideGround(collisions);
			break;
		}
	}

	onCollideWall(walls) {
		this.velX *= -1;
		CollisionResolver.forgotCollisionWithLayer(this, 'WALLS');
	}
	
	onCollideGround(collisions) {
		this.dispose();
	}

	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x, this.position.y);
	}

	move() {
		this.velX *= this.airResistance;
		this.velY -= this.gravity;
		if (this.isFalling === false && this.velY < 0) {
			this.switchToFalling();
		}
		this.position.x += this.velX;
		this.position.y += this.velY;
		this.sprite.setPosition(this.position.x, this.position.y, 12);
	}

	switchToFalling() {
		this.isFalling = true;
		this.sprite.changeAnimation('bonusFalling');
		this.gravity = 0.001;
		this.airResistance = 0.9;
	}
	
	update(step, time) {
		this.move(time);
	}

	dispose() {
		CollisionResolver.forgotCollisionWithLayer(this, 'MAP');
		CollisionResolver.forgotCollisionWithLayer(this, 'WALLS');
		CollisionResolver.removeFromLayer(this, 'BONUS');
		AnimationControl.unregisterToUpdate(this);
		this.sprite.dispose();
		this.hitBox.dispose();
	}
}