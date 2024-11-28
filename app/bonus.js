import {
	Vector2
} from '../vendor/three.module.js';
import CollisionResolver from './collisionResolver.js';
import Hitbox from './collisionHitbox.js';
import * as SpriteFactory from './spriteFactory.js';
import RayLauncher from './weapons/rayLauncher.js';


export class Bonus {

	constructor(posX, posY, map) {
		this.weapon = new RayLauncher(map);
		this.position = new Vector2(posX, posY);
		this.hitBox = new Hitbox(-2, 2, -2, 2, true);
		CollisionResolver.addToLayer(this, 'BONUS');

		this.sprite = SpriteFactory.createAnimatedSprite(4, 4, 'bonusBullet');
		this.sprite.setPosition(this.position.x, this.position.y);
		this.sprite.setDepth(4);
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
	}
}