import * as THREE from '../vendor/three.module.js';
import * as AnimationControl from './animationControl.js';
import CollisionResolver from './collisionResolver.js';
import Hitbox from './collisionHitbox.js';
import * as SpriteFactory from './spriteFactory.js';
import * as Particules from './particules.js';
import {randomDirection} from './utils/math.js';


class EggWall {

	constructor(posX, posY) {
		this.gravity = 0.002;
		this.airResistance = 1;
		this.velY = 0;
		this.position = new THREE.Vector2(posX + randomDirection(1), posY);
		AnimationControl.registerToUpdate(this);
		this.hitBox = new Hitbox(-1.5, 1.5, -1.5, 1.5, true);
		CollisionResolver.checkCollisionWithLayer(this, 'MAP');

		this.sprite = SpriteFactory.createAnimatedSprite(5, 5, 'eggWall');
		this.sprite.setPosition(this.position.x, this.position.y);

        this.particules = new Particules.EggWallParticules(this);
	}

	onCollide(collisions, layersName) {
		this.dispose();
	}

	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x, this.position.y);
	}

	move() {
		this.velY -= this.gravity;
		this.position.y += this.velY;
		this.sprite.setPosition(this.position.x, this.position.y, 12);
	}
	
	update(step, time) {
		this.move(time);
	}

	dispose() {
		CollisionResolver.forgotCollisionWithLayer(this, 'MAP');
		AnimationControl.unregisterToUpdate(this);
		this.sprite.dispose();
		this.hitBox.dispose();
		this.particules.dispose();
	}
}

export {EggWall as default};