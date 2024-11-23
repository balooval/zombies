import {Vector2} from '../vendor/three.module.js';
import * as AnimationControl from './animationControl.js';
import CollisionResolver from './collisionResolver.js';
import EggWall from './eggWall.js';
import Hitbox from './collisionHitbox.js';
import {HitSprite} from './fxSprites.js';
import * as Particules from './particules.js';
import * as SoundLoader from './net/loaderSound.js';
import * as SpriteFactory from './spriteFactory.js';
import Stone from './stone.js';
import * as UiScore from './ui/score.js';


class Egg {

	constructor(posX, posY, angle, owner) {
		this.angle = angle;
		this.owner = owner;
		this.gravity = 0.04;
		this.airResistance = 1;
		const speed = 3;
		
		this.velX = Math.cos(angle) * speed;
		this.velY = Math.sin(angle) * speed;
		this.position = new Vector2(posX, posY);
		AnimationControl.registerToUpdate(this);
		this.hitBox = new Hitbox(-1, 1, -1, 1, true);
		CollisionResolver.checkCollisionWithLayer(this, 'ENNEMIES');
		CollisionResolver.checkCollisionWithLayer(this, 'WALLS');
		CollisionResolver.checkCollisionWithLayer(this, 'BONUS');

		this.sprite = SpriteFactory.createAnimatedSprite(3, 3, 'eggLaunch');
		this.sprite.setPosition(this.position.x, this.position.y);
	}

	onCollide(collisions, layersName) {
		switch (layersName) {
			case 'WALLS':
				this.onCollideWall(collisions);
			break;

			case 'BONUS':
				console.log('HIT BONUS');
				this.onCollideBonus(collisions);
			break;

			case 'ENNEMIES':
				// const enemies = collisions.filter(collision => collision instanceof Wolf);
				// this.onCollideEnnemies(enemies);
				this.onCollideEnnemies(collisions);
			break;
		}

		const stones = collisions.filter(collision => collision instanceof Stone);

		for (const stone of stones) {
			stone.stopLaunchAndFall();
		}

	}

	onCollideBonus(bonusList) {
		for (const bonus of bonusList) {
			const gain = bonus.take();
			this.owner.addBonus(gain);

			CollisionResolver.forgotCollisionWithLayer(this, 'BONUS');
			this.stopLaunchAndFall();
			SoundLoader.play('eggCrack', 0.2); // TODO: mettre un chouette son
		}

		Particules.create(Particules.EGG_EXPLOSION, this.position, new Vector2(1, 0.7));
	}

	onCollideEnnemies(enemies) {
		for (const zombi of enemies) {
			UiScore.addPoints(zombi.pointValue);
			zombi.takeDamage();
			CollisionResolver.forgotCollisionWithLayer(this, 'ENNEMIES');
			// this.stopLaunchAndFall();
			// const hitSprite = new HitSprite(this.position.x, this.position.y, 6);
			Particules.create(Particules.ENNEMI_HIT, this.position, new Vector2(this.velX, this.velY));
			SoundLoader.play('eggCrack', 0.2);
		}

		Particules.create(Particules.EGG_EXPLOSION, this.position, new Vector2(1, 0.7));
		this.dispose();
	}

	onCollideWall(walls) {
		for (const wall of walls) {
			CollisionResolver.forgotCollisionWithLayer(this, 'WALLS');
			const hitSprite = new HitSprite(this.position.x, this.position.y, 6);
			SoundLoader.play('eggCrack', 0.2);
		}

		Particules.create(Particules.EGG_EXPLOSION, this.position, new Vector2(1, 0.7));
		// const eggWall = new EggWall(this.position.x, this.position.y);
		this.dispose();
	}

	stopLaunchAndFall() {
		this.sprite.changeAnimation('eggFall')
		this.velX = 0.1;
	}

	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x, this.position.y);
	}

	move() {
		this.position.x += this.velX;
		this.position.y += this.velY;
		this.sprite.setPosition(this.position.x, this.position.y, 12);
	}
	
	update(step, time) {
		this.move(time);
	}

	dispose() {
		CollisionResolver.forgotCollisionWithLayer(this, 'MAP');
		CollisionResolver.forgotCollisionWithLayer(this, 'WALLS');
		CollisionResolver.forgotCollisionWithLayer(this, 'ENNEMIES');
		CollisionResolver.forgotCollisionWithLayer(this, 'BONUS');
		AnimationControl.unregisterToUpdate(this);
		this.sprite.dispose();
		this.hitBox.dispose();
	}
}

export {Egg as default};