import Evt from './utils/event.js';
import * as Input from './input.js';
import * as Mouse from './inputMouse.js';
import * as AnimationControl from './animationControl.js';
import Hitbox from './collisionHitbox.js';
import CollisionResolver from './collisionResolver.js';
import {
	PLAYER_START_POSITION,
	PLAYER_MAX_POS_X,
	PLAYER_MIN_POS_X,
	PLAYER_MAX_POS_Y,
	PLAYER_MIN_POS_Y,
} from './map/map.js';
import * as SpriteFactory from './spriteFactory.js';
import * as Stepper from './utils/stepper.js';
import { ActiveWeapon, BasicBulletLauncher } from './weapons.js';

export const PLAYER_IS_DEAD_EVENT = 'PLAYER_IS_DEAD_EVENT';

export class Player {

	constructor() {
		this.evt = new Evt();
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
		
	}

	move() {
		const translation = this.#getTranslation();
		this.#applyAcceleration(translation.total);
		this.#applyTranslation(translation.x, translation.y);
	}

	#applyAcceleration(totalTranslation) {
		if (totalTranslation > 0) {
			this.moveSpeed = Math.min(this.moveSpeed + this.acceleration, 1.2);			
			return;
		}
		this.moveSpeed = 0;
	}

	#getTranslation() {
		const directionX = this.inputMoves.right - this.inputMoves.left;
		const directionY = this.inputMoves.up - this.inputMoves.down;
		const angle = Math.atan2(directionY, directionX);
		if (directionX === 0 && directionY === 0) {
			return {
				x: 0,
				y: 0,
				total: 0,
			};
		}

		const x = Math.cos(angle);
		const y = Math.sin(angle);
		return {
			x: x,
			y: y,
			total: Math.abs(x) + Math.abs(y),
		}
	}

	#applyTranslation(translationX, translationY) {
		const previousX = this.position.x;
		const previousY = this.position.y;
		this.position.x += translationX * this.moveSpeed;
		this.position.y += translationY * this.moveSpeed;
		this.position.x = Math.max(PLAYER_MIN_POS_X, Math.min(this.position.x, PLAYER_MAX_POS_X));
		this.position.y = Math.max(PLAYER_MIN_POS_Y, Math.min(this.position.y, PLAYER_MAX_POS_Y));

		if (previousX === this.position.x && previousY === this.position.y) {
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