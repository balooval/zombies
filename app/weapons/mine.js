import * as AnimationControl from '../animationControl.js';
import * as MATH from '../utils/math.js';
import * as Particules from '../particules.js';
import * as Renderer from '../renderer.js';
import * as SoundLoader from '../net/loaderSound.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as Stepper from '../utils/stepper.js';

import CollisionResolver from '../collisionResolver.js';
import {HitSprite} from './../fxSprites.js';
import {Hitbox} from '../collisionHitbox.js';
import {Vector2} from '../../vendor/three.module.js';

class Mine {
	constructor(position, targetPosition, owner) {
		this.targetX = targetPosition.x;
		this.targetY = targetPosition.y;
		this.owner = owner;
		this.gravity = 0.04;
		this.airResistance = 0.9;

		const distance = MATH.distance(position, targetPosition);
		const speed = Math.min(5, distance / 10);
		
		this.velX = Math.cos(this.owner.viewAngle) * speed;
		this.velY = Math.sin(this.owner.viewAngle) * speed;

		this.position = new Vector2(position.x, position.y);
		AnimationControl.registerToUpdate(this);
		this.hitBox = new Hitbox(-2, 2, -2, 2, true);
		CollisionResolver.checkCollisionWithLayer(this, 'WALLS');

		this.sprite = SpriteFactory.createAnimatedSprite(5, 5, 'mine');
		this.sprite.setPosition(this.position.x, this.position.y);

		this.updateFunction = this.move;
		this.isActive = false;
		this.nextStep = 0;
	}

	doNothing() {

	}

	update() {
		this.updateFunction();
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
		const vector = new Vector2(0, 0);
		
		SoundLoader.playRandom(['bombA', 'bombB'], 0.5);
		Renderer.drawFogFlux(this.position.x, this.position.y, 1, 1);
		
		for (const zombi of enemies) {

			const zombiPosition = zombi.getPosition();
			vector.x = (zombiPosition.x - this.position.x) * 0.3;
			vector.y = (zombiPosition.y - this.position.y) * 0.3;

			const distance = MATH.distance(this.position, zombiPosition);
			const damages = Math.max(0, 12 - distance) * 0.5;

			zombi.takeDamage(vector, damages);
			Particules.create(Particules.ENNEMI_HIT, this.position, vector);
		}

		const hitSprite = new HitSprite(this.position.x, this.position.y, 15, 60);
		Particules.create(Particules.EGG_EXPLOSION, this.position, new Vector2(1, 0.7));
		this.dispose();
	}

	#onCollideWall(walls) {
		this.stopMove();
	}

	move() {
		this.velX *= this.airResistance;
		this.velY *= this.airResistance;
		const movementQuantity = Math.abs(this.velX) + Math.abs(this.velY);

		Renderer.setFogFlux(this.position.x, this.position.y, this.position.x + this.velX, this.position.y + this.velY, 15, 0.5);

		this.position.x += this.velX;
		this.position.y += this.velY;
		this.sprite.setPosition(this.position.x, this.position.y);
		this.sprite.setRotation(this.sprite.getRotation() + movementQuantity * 0.2);

		
		if (movementQuantity < 0.1) {
			this.stopMove();

		}
	}

	stopMove() {
		this.updateFunction = this.doNothing;
		CollisionResolver.forgotCollisionWithLayer(this, 'WALLS');

		this.velX = 0;
		this.velY = 0;

		this.hitBox.dispose();
		this.hitBox = new Hitbox(-10, 10, -10, 10, true);

		this.blink();

		Renderer.drawFogFlux(this.position.x, this.position.y, 0.7, 1);
	}
	
	blink() {
		Stepper.stopListenStep(Stepper.curStep, this, this.blink);
		
		this.isActive = !this.isActive;
		
		if (this.isActive === true) {
			this.nextStep = Stepper.curStep + 3;
			CollisionResolver.checkCollisionWithLayer(this, 'ENNEMIES');
		} else {
			this.nextStep = Stepper.curStep + 50;
			CollisionResolver.forgotCollisionWithLayer(this, 'ENNEMIES');
		}

		Stepper.listenStep(this.nextStep, this, this.blink);
	}

	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x, this.position.y);
	}
	
	dispose() {
		Stepper.stopListenStep(this.nextStep, this, this.blink);
		CollisionResolver.forgotCollisionWithLayer(this, 'WALLS');
		CollisionResolver.forgotCollisionWithLayer(this, 'ENNEMIES');
		AnimationControl.unregisterToUpdate(this);
		this.sprite.dispose();
		this.hitBox.dispose();
	}
}

export {Mine as default};