import Evt from './utils/event.js';
import * as Input from './input.js';
import * as Mouse from './inputMouse.js';
import * as AnimationControl from './animationControl.js';
import Hitbox from './collisionHitbox.js';
import Translation from './translation.js';
import CollisionResolver from './collisionResolver.js';
import {
	PLAYER_START_POSITION,
	PLAYER_MAX_POS_X,
	PLAYER_MIN_POS_X,
	PLAYER_MAX_POS_Y,
	PLAYER_MIN_POS_Y,
} from './map/map.js';
import * as SpriteFactory from './spriteFactory.js';
import * as MATH from './utils/math.js';
import * as Stepper from './utils/stepper.js';
import { ActiveWeapon, BasicBulletLauncher } from './weapons.js';
import {
	getIntersection
} from './intersectionResolver.js';

export const PLAYER_IS_DEAD_EVENT = 'PLAYER_IS_DEAD_EVENT';

export class Player {

	constructor(map) {
		this.evt = new Evt();
		this.map = map;
		this.lifePoints = 1;
		this.acceleration = 0.05;
		this.moveSpeed = 0.2;
		this.viewAngle = 0;
		this.position = PLAYER_START_POSITION;
		this.inputMoves = {
			left: 0,
			right: 0,
			up: 0,
			down: 0,
		};

		Mouse.evt.addEventListener(Mouse.MOUSE_DOWN, this, this.onMouseDown);
		Mouse.evt.addEventListener(Mouse.MOUSE_UP, this, this.onMouseUp);
		Input.evt.addEventListener('LEFT', this, this.onKeyDown);
		Input.evt.addEventListener('RIGHT', this, this.onKeyDown);
		Input.evt.addEventListener('DOWN', this, this.onKeyDown);
		Input.evt.addEventListener('UP', this, this.onKeyUp);
		Input.evt.addEventListener('SPACE', this, this.onKeyUp);

		AnimationControl.registerToUpdate(this);
		this.hitBox = new Hitbox(-3, 3, -3, 2, true);
		CollisionResolver.addToLayer(this, 'PLAYER');
		
		this.endShotAnimatonStep = 0;
		this.isShoting = false;
		const baseWeapon = new BasicBulletLauncher();
		baseWeapon.setOwner(this);
		this.weapon = new ActiveWeapon(baseWeapon);
		this.weaponPointer = new WeaponPointer();
		
		this.translation = new Translation();

		this.sprite = SpriteFactory.createAnimatedSprite(10, 10, 'pouleIdle');
		this.sprite.setPosition(this.position.x, this.position.y);
	}

	hit() {
		this.lifePoints --;

		if (this.lifePoints <= 0) {
			this.evt.fireEvent(PLAYER_IS_DEAD_EVENT);
		}
	}

	addBonus(bonus) {
		bonus.setOwner(this);
		this.weapon.changeWeapon(bonus);
	}

	update() {
		this.move();
		this.#updateViewAngle();
	}

	#updateViewAngle() {
		this.viewAngle = Math.atan2(Mouse.worldPosition[1] - this.position.y, Mouse.worldPosition[0] - this.position.x);
		this.weaponPointer.setPosition(Mouse.worldPosition[0], Mouse.worldPosition[1]);
		this.sprite.setRotation(this.viewAngle);
	}

	move() {
		this.#updateTranslation();
		this.#applyAcceleration();
		this.#applyTranslation();
	}

	#applyAcceleration() {
		if (this.translation.length > 0) {
			this.moveSpeed = Math.min(this.moveSpeed + this.acceleration, 0.6);			
			return;
		}
		this.moveSpeed = 0;
	}

	#updateTranslation() {
		const directionX = this.inputMoves.right - this.inputMoves.left;
		const directionY = this.inputMoves.up - this.inputMoves.down;
		if (directionX === 0 && directionY === 0) {
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
			directionX,
			directionY,
			this.moveSpeed
		);
		
		// this.sprite.setRotation(this.translation.angle);
		// this.sprite.setRotation(this.viewAngle);
	}

	#applyTranslation() {
		const wallHit = this.map.blocks.map(block => getIntersection(this.translation, block.hitBox)).filter(res => res).pop();

		let newPosX = this.translation.destX;
		let newPosY = this.translation.destY;

		if (wallHit) {
			newPosX = this.translation.startX;
			newPosY = this.translation.startY;
		}


		this.position.x = newPosX;
		this.position.y = newPosY;
		this.position.x = Math.max(PLAYER_MIN_POS_X, Math.min(this.position.x, PLAYER_MAX_POS_X));
		this.position.y = Math.max(PLAYER_MIN_POS_Y, Math.min(this.position.y, PLAYER_MAX_POS_Y));

		if (this.translation.length === 0) {
			this.moveSpeed = 0;
		}
		this.sprite.setPosition(this.position.x, this.position.y);
	}
	
	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x + 4, this.position.y + 2);
	}

	onShot() {
		this.isShoting = true;
		this.sprite.changeAnimation('pouleShot');
		Stepper.stopListenStep(this.endShotAnimatonStep, this, this.setToIdle);
		this.weapon.startShot();
	}

	onStopShot() {
		this.isShoting = false;
		Stepper.stopListenStep(this.endShotAnimatonStep, this, this.setToIdle);
		this.endShotAnimatonStep = Stepper.curStep + 12,
		Stepper.listenStep(this.endShotAnimatonStep, this, this.setToIdle);
		this.weapon.stopShot();
	}

	setToIdle() {
		if (this.isShoting === true) {
			return;
		}
		this.sprite.changeAnimation('pouleIdle');
	}

	onMouseDown() {
		this.onShot();
	}

	onMouseUp() {
		this.onStopShot();
	}

	onKeyDown(code) {
		switch (code) {
			case 'LEFT':
				this.inputMoves.left = 1;
			break;
			case 'RIGHT':
				this.inputMoves.right = 1;
			break;
			case 'DOWN':
				this.inputMoves.down = 1;
			break;
			case 'UP':
				this.inputMoves.up = 1;
			break;
			case 'SPACE':
				this.onShot();
			break;
		}
	}
	
	onKeyUp(code) {
		switch (code) {
			case 'LEFT':
				this.inputMoves.left = 0;
			break;
			case 'RIGHT':
				this.inputMoves.right = 0;
			break;
			case 'DOWN':
				this.inputMoves.down = 0;
			break;
			case 'UP':
				this.inputMoves.up = 0;
			break;
			case 'SPACE':
				this.onStopShot();
			break;
		}
	}

	dispose() {
		// TODO
	}
}

class WeaponPointer {
    constructor() {
        this.sprite = SpriteFactory.createAnimatedSprite(4, 4, 'pointer');
        this.sprite.setPosition(0, 0);
    }

	setPosition(x, y) {
		this.sprite.setPosition(x, y);
	}
}