import Evt from './utils/event.js';
import * as Input from './input.js';
import * as Mouse from './inputMouse.js';
import * as AnimationControl from './animationControl.js';
import * as WeaponList from './ui/weaponList.js';
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
import * as Stepper from './utils/stepper.js';
import { ActiveWeapon } from './weapons/activeWeapon.js';
import Batte from './weapons/batte.js';
import BombLauncher from './weapons/bombLauncher.js';
import Minigun from './weapons/minigun.js';
import RayLauncher from './weapons/rayLauncher.js';
import BulletLauncher from './weapons/bulletLauncher.js';
import {getIntersection} from './intersectionResolver.js';

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

		Mouse.evt.addEventListener(Mouse.WHEEL_DOWN, this, this.onWheelDown);
		Mouse.evt.addEventListener(Mouse.WHEEL_UP, this, this.onWheelUp);
		Mouse.evt.addEventListener(Mouse.MOUSE_DOWN, this, this.onMouseDown);
		Mouse.evt.addEventListener(Mouse.MOUSE_UP, this, this.onMouseUp);
		Input.evt.addEventListener('DOWN', this, this.onKeyDown);
		Input.evt.addEventListener('UP', this, this.onKeyUp);
		Input.evt.addEventListener('SPACE', this, this.onKeyUp);

		AnimationControl.registerToUpdate(this);
		this.hitBox = new Hitbox(-3, 3, -3, 3, true);
		CollisionResolver.addToLayer(this, 'PLAYER');

		this.hitCooldown = 0;
		
		this.endShotAnimatonStep = 0;
		this.isShoting = false;
		const baseWeapon = new Batte();
		// const baseWeapon = new RayLauncher(this.map);
		// const baseWeapon = new BulletLauncher();
		// const baseWeapon = new BulletLauncher(this.map);
		// const baseWeapon = new BombLauncher();
		// const baseWeapon = new Minigun(this.map);
		baseWeapon.setOwner(this);

		this.weaponTargetPosition = {x: 0, y: 0};
		this.weaponPointer = new WeaponPointer();
		
		this.weapon = new ActiveWeapon(this);
		this.currentWeaponIndex = 0;
		this.weaponsList = [];
		this.#addWeapon(baseWeapon);
		
		this.translation = new Translation();

		this.sprite = SpriteFactory.createAnimatedSprite(10, 10, 'playerWalk');
		this.sprite.setPosition(this.position.x, this.position.y);

		CollisionResolver.checkCollisionWithLayer(this, 'BONUS');

		this.currentAnimation = '';
	}

	onCollide(collisions, layersName) {
		switch (layersName) {
			case 'BONUS':
				this.#onCollideBonus(collisions);
			break;
		}
	}

	#onCollideBonus(collisions) {
		collisions.forEach(bonus => {
			const weapon = bonus.take();
			this.#addWeapon(weapon);
		});
	}

	#addWeapon(weapon) {
		const sameWeapon = this.weaponsList.filter(w => w.constructor.name === weapon.constructor.name).pop();
		if (sameWeapon) {
			sameWeapon.addAmmo(weapon.ammo);
			return;
		}
		weapon.setOwner(this);
		this.weaponsList.push(weapon);
		WeaponList.addWeapon(weapon);
		WeaponList.setActive(weapon);
		this.weapon.changeWeapon(weapon);


		this.currentWeaponIndex = this.weaponsList.length - 1;
	}

	changeAnimation(animationId) {
		if (animationId === this.currentAnimation) {
			return;
		}
		this.currentAnimation = animationId;
		this.sprite.changeAnimation(this.currentAnimation);
	}

	hit(zombi) {
		console.warn('HIT', zombi);

		if (this.hitCooldown > 0) {
			return;
		}
		
		this.hitCooldown = 30;

		// console.log('hit');
		// return;
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
		this.hitCooldown = Math.max(0, this.hitCooldown - 1);
		this.move();
		this.#updateViewAngle();
		this.weapon.update();
	}

	#updateViewAngle() {
		this.viewAngle = Math.atan2(Mouse.worldPosition[1] - this.position.y, Mouse.worldPosition[0] - this.position.x);
		this.weaponTargetPosition.x = Mouse.worldPosition[0];
		this.weaponTargetPosition.y = Mouse.worldPosition[1];
		this.weaponPointer.setPosition(this.weaponTargetPosition.x, this.weaponTargetPosition.y);
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

		this.changeAnimation('playerWalk');
		
		if (this.translation.length === 0) {
			this.changeAnimation('playerIdle');
			this.moveSpeed = 0;
		}
		this.sprite.setPosition(this.position.x, this.position.y);
	}
	
	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x, this.position.y);
	}

	onShot() {
		this.isShoting = true;
		// this.sprite.changeAnimation('playerIdle');
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
		// this.changeAnimation('playerWalk');
	}

	onWheelDown() {
		this.currentWeaponIndex --;
		if (this.currentWeaponIndex < 0) {
			this.currentWeaponIndex = this.weaponsList.length - 1;
		}
		const prevWeapon = this.weaponsList[this.currentWeaponIndex];
		this.weapon.changeWeapon(prevWeapon);
		WeaponList.setActive(prevWeapon);
	}
	
	onWheelUp() {
		this.currentWeaponIndex ++;
		if (this.currentWeaponIndex >= this.weaponsList.length) {
			this.currentWeaponIndex = 0;
		}
		const nextWeapon = this.weaponsList[this.currentWeaponIndex];
		this.weapon.changeWeapon(nextWeapon);
		WeaponList.setActive(nextWeapon);
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
			case 'Q':
				this.inputMoves.left = 1;
			break;
			case 'RIGHT':
			case 'D':
				this.inputMoves.right = 1;
			break;
			case 'DOWN':
			case 'S':
				this.inputMoves.down = 1;
			break;
			case 'UP':
			case 'Z':
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
			case 'Q':
				this.inputMoves.left = 0;
			break;
			case 'RIGHT':
			case 'D':
				this.inputMoves.right = 0;
			break;
			case 'DOWN':
			case 'S':
				this.inputMoves.down = 0;
			break;
			case 'UP':
			case 'Z':
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