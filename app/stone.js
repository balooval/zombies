import {
	Vector2
} from '../vendor/three.module.js';
import * as AnimationControl from './animationControl.js';
import CollisionResolver from './collisionResolver.js';
import Hitbox from './collisionHitbox.js';
import * as SoundLoader from './net/loaderSound.js';
import {HitSprite} from './fxSprites.js';
import * as SpriteFactory from './spriteFactory.js';

class Stone {

	constructor(posX, posY, velocityX, velocityY) {
		this.gravity = 0.02;
		this.airResistance = 1;
		this.velX = velocityX;
		this.velY = velocityY;
		this.position = new Vector2(posX, posY);
		AnimationControl.registerToUpdate(this);
		this.hitBox = new Hitbox(-1, 1, -1, 1, true);
        CollisionResolver.addToLayer(this, 'ENNEMIES');
		CollisionResolver.checkCollisionWithLayer(this, 'MAP');
		CollisionResolver.checkCollisionWithLayer(this, 'WALLS');
		CollisionResolver.checkCollisionWithLayer(this, 'PLAYER');

		this.sprite = SpriteFactory.createAnimatedSprite(3, 3, 'stoneLaunch');
		this.sprite.setPosition(this.position.x, this.position.y);
	}

	onCollide(collisions, layersName) {
		switch (layersName) {
			case 'WALLS':
				this.onCollideWall(collisions);
			break;

			case 'MAP':
				this.onCollideGround(collisions);
			break;

			case 'PLAYER':
				this.onCollidePlayer(collisions);
			break;
		}
	}

	onCollidePlayer(players) {
		this.stopLaunchAndFall();
		players.forEach(player => player.hit());
		const hitSprite = new HitSprite(this.position.x, this.position.y, 4);
		SoundLoader.play('clap');
	}

	onCollideWall(walls) {
		this.stopLaunchAndFall();
		const hitSprite = new HitSprite(this.position.x, this.position.y, 4);
		SoundLoader.play('clap');
	}
	
	onCollideGround(collisions) {
		const hitSprite = new HitSprite(this.position.x, this.position.y, 4);
		SoundLoader.play('clap');
		this.dispose();
	}

	stopLaunchAndFall() {
        CollisionResolver.forgotCollisionWithLayer(this, 'WALLS');
        CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
        this.sprite.changeAnimation('stoneFall')
		this.velX = -0.1;
		this.gravity = 0.05;
		this.airResistance = 0.97;
	}

	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x, this.position.y);
	}

	move() {
		this.velX *= this.airResistance;
		this.velY -= this.gravity;
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
		CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
		AnimationControl.unregisterToUpdate(this);
		this.sprite.dispose();
		this.hitBox.dispose();
	}
}

export {Stone as default};