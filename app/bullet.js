import {Vector2} from '../vendor/three.module.js';
import * as AnimationControl from './animationControl.js';
import CollisionResolver from './collisionResolver.js';
import Hitbox from './collisionHitbox.js';
import {HitSprite} from './fxSprites.js';
import * as Particules from './particules.js';
import * as SoundLoader from './net/loaderSound.js';
import * as SpriteFactory from './spriteFactory.js';
import * as UiScore from './ui/score.js';

class Bullet {

	constructor(posX, posY, angle, owner) {
		this.angle = angle;
		this.owner = owner;
		this.gravity = 0.04;
		this.airResistance = 1;
		const speed = 3;
		
		this.velX = Math.cos(angle) * speed;
		this.velY = Math.sin(angle) * speed;
		this.vector = new Vector2(this.velX, this.velY)
		this.position = new Vector2(posX, posY);
		AnimationControl.registerToUpdate(this);
		this.hitBox = new Hitbox(-1, 1, -1, 1, true);
		CollisionResolver.checkCollisionWithLayer(this, 'ENNEMIES');
		CollisionResolver.checkCollisionWithLayer(this, 'WALLS');

		this.sprite = SpriteFactory.createAnimatedSprite(3, 3, 'eggLaunch');
		this.sprite.setPosition(this.position.x, this.position.y);
	}

	onCollide(collisions, layersName) {
		switch (layersName) {
			case 'WALLS':
				this.#onCollideWall(collisions);
			break;

			case 'ENNEMIES':
				this.#onCollideEnnemies(collisions);
			break;
		}
	}

	#onCollideEnnemies(enemies) {
		for (const zombi of enemies) {
			UiScore.addPoints(zombi.pointValue);
			zombi.takeDamage(this.vector);
			CollisionResolver.forgotCollisionWithLayer(this, 'ENNEMIES');
			Particules.create(Particules.ENNEMI_HIT, this.position, this.vector);
			SoundLoader.play('eggCrack', 0.2);
		}

		Particules.create(Particules.EGG_EXPLOSION, this.position, new Vector2(1, 0.7));
		this.dispose();
	}

	#onCollideWall(walls) {
		for (const wall of walls) {
			CollisionResolver.forgotCollisionWithLayer(this, 'WALLS');
			const hitSprite = new HitSprite(this.position.x, this.position.y, 6);
			SoundLoader.play('eggCrack', 0.2);
		}

		Particules.create(Particules.EGG_EXPLOSION, this.position, new Vector2(1, 0.7));
		this.dispose();
	}

	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x, this.position.y);
	}

	move() {
		this.position.x += this.velX;
		this.position.y += this.velY;
		this.sprite.setPosition(this.position.x, this.position.y, 12);
	}
	
	update() {
		this.move();
	}

	dispose() {
		CollisionResolver.forgotCollisionWithLayer(this, 'WALLS');
		CollisionResolver.forgotCollisionWithLayer(this, 'ENNEMIES');
		AnimationControl.unregisterToUpdate(this);
		this.sprite.dispose();
		this.hitBox.dispose();
	}
}

export {Bullet as default};