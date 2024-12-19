import * as AnimationControl from './../animationControl.js';
import * as Particules from './../particules.js';
import * as Renderer from '../renderer.js';
import * as SoundLoader from './../net/loaderSound.js';
import * as SpriteFactory from './../spriteFactory.js';

import CollisionResolver from './../collisionResolver.js';
import {DISPOSE_EVENT}  from '../map/map.js';
import {HitSprite} from './../fxSprites.js';
import {Hitbox} from './../collisionHitbox.js';
import {Vector2} from './../../vendor/three.module.js';
import {getCurrentMap} from '../gameLevel.js';

class Bullet {

	constructor(posX, posY, angle) {
		this.angle = angle;
		const speed = 2;
		
		this.velX = Math.cos(angle) * speed;
		this.velY = Math.sin(angle) * speed;
		this.vector = new Vector2(this.velX, this.velY)
		this.position = new Vector2(posX, posY);
		AnimationControl.registerToUpdate(this);
		this.hitBox = new Hitbox(-1, 1, -1, 1, true);
		CollisionResolver.checkCollisionWithLayer(this, 'ENNEMIES');
		CollisionResolver.checkCollisionWithLayer(this, 'WALLS');

		this.sprite = SpriteFactory.createAnimatedSprite(3, 3, 'bullet');
		this.sprite.setPosition(this.position.x, this.position.y);

		getCurrentMap().evt.addEventListener(DISPOSE_EVENT, this, this.dispose);
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
			zombi.takeDamage(this.vector, 0.4);
			CollisionResolver.forgotCollisionWithLayer(this, 'ENNEMIES');
			// Particules.create(Particules.ENNEMI_HIT, this.position, this.vector);
			SoundLoader.play('eggCrack', 0.2);
		}

		Particules.create(Particules.EGG_EXPLOSION, this.position, new Vector2(1, 0.7));
		this.dispose();
	}

	#onCollideWall(walls) {
		CollisionResolver.forgotCollisionWithLayer(this, 'WALLS');

		for (const wall of walls) {
			wall.takeDamage(this.vector, 0.4);
		}
		
		const hitSprite = new HitSprite(this.position.x, this.position.y, 6, 10);
		SoundLoader.play('eggCrack', 0.2);

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

		Renderer.setFogFlux(this.position.x, this.position.y, this.position.x + this.velX, this.position.y + this.velY, 5, 1);
	}
	
	update() {
		this.move();
	}

	dispose() {
		getCurrentMap().evt.removeEventListener(DISPOSE_EVENT, this, this.dispose);
		CollisionResolver.forgotCollisionWithLayer(this, 'WALLS');
		CollisionResolver.forgotCollisionWithLayer(this, 'ENNEMIES');
		AnimationControl.unregisterToUpdate(this);
		this.sprite.dispose();
		this.hitBox.dispose();
	}
}

export {Bullet as default};