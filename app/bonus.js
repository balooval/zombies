import * as MATH from './utils/math.js';
import * as SpriteFactory from './spriteFactory.js';

import BulletLauncher from './weapons/bulletLauncher.js';
import CollisionResolver from './collisionResolver.js';
import GrenadeLauncher from './weapons/grenadeLauncher.js';
import {Hitbox} from './collisionHitbox.js';
import MineLauncher from './weapons/mineLauncher.js';
import Minigun from './weapons/minigun.js';
import RayLauncher from './weapons/rayLauncher.js';
import {
	Vector2
} from '../vendor/three.module.js';

export const pool = new Map();

export function createRandomBonus(choices, destPos, map) {
	const bonusName = MATH.randomElement(choices);
	
	switch (bonusName) {
		case 'BonusGun':
			return new BonusGun(destPos.x, destPos.y, map);
			
		case 'BonusMine':
			return new BonusMine(destPos.x, destPos.y, map);

		case 'BonusEgg':
			return new BonusEgg(destPos.x, destPos.y, map);

		case 'BonusMinigun':
			return new BonusMinigun(destPos.x, destPos.y, map);

		case 'BonusGrenade':
			return new BonusGrenade(destPos.x, destPos.y, map);
	}
}

export class Bonus {

	constructor(posX, posY, spriteId) {
		this.weapon = null;
		this.position = new Vector2(posX, posY);
		this.hitBox = new Hitbox(-2, 2, -2, 2, true);
		CollisionResolver.addToLayer(this, 'BONUS');

		this.sprite = SpriteFactory.createAnimatedSprite(6, 6, spriteId);
		this.sprite.setPosition(this.position.x, this.position.y);
		this.sprite.setDepth(4);

		pool.set(this, this);
	}

	take() {
		this.dispose();
		return this.weapon;
	}

	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x, this.position.y);
	}

	dispose() {
		CollisionResolver.removeFromLayer(this, 'BONUS');
		this.sprite.dispose();
		this.hitBox.dispose();
		pool.delete(this);
	}
}

export class BonusEgg extends Bonus {

	constructor(posX, posY, map) {
		super(posX, posY, 'bullet');
		this.weapon = new BulletLauncher();
	}
}

export class BonusMinigun extends Bonus {

	constructor(posX, posY, map) {
		super(posX, posY, 'bonusMinigun');
		this.weapon = new Minigun(map);
	}
}

export class BonusGun extends Bonus {

	constructor(posX, posY, map) {
		super(posX, posY, 'bonusBullet');
		this.weapon = new RayLauncher(map);
	}
}

export class BonusGrenade extends Bonus {

	constructor(posX, posY, map) {
		super(posX, posY, 'bonusGrenade');
		this.weapon = new GrenadeLauncher();
	}
}

export class BonusMine extends Bonus {

	constructor(posX, posY, map) {
		super(posX, posY, 'mineIcon');
		this.weapon = new MineLauncher();
	}
}