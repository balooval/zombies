import * as MATH from '../utils/math.js';
import * as SoundLoader from '../net/loaderSound.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as Stepper from '../utils/stepper.js';

import {
	ANIMATION_END_EVENT,
} from '../textureAnimation.js';
import BloodDropping from './bloodDropping.js'
import CollisionResolver from './../collisionResolver.js';
import { CompositeSprite } from '../sprite.js';
import Hitable from './hitable.js'
import {Hitbox} from '../collisionHitbox.js';
import Move from './move.js';
import PlayerFinder from './playerFinder.js';
import {State} from '../states.js';
import Translation from '../translation.js';

class StateFollow extends State {
	constructor(position, player, map) {
		super(position);
		this.entitieToReach = player;

		this.setHitBox(new Hitbox(-3, 3, -3, 3, true));


		// const compositeSprite = new CompositeSprite();
		// const tronc = SpriteFactory.createAnimatedSprite(8, 8, 'zombiWalkTronc');
		// const cou = SpriteFactory.createAnimatedSprite(8, 8, 'zombiWalkCou');
		// const brain = SpriteFactory.createAnimatedSprite(8, 8, 'zombiWalkBrain');
		// const crane = SpriteFactory.createAnimatedSprite(8, 8, 'zombiWalkCrane');
		// compositeSprite.addSprite('base', tronc);
		// compositeSprite.addSprite('cou', cou);
		// compositeSprite.addSprite('life2', brain);
		// compositeSprite.addSprite('life3', crane);
		// compositeSprite.hide();
		// compositeSprite.setPosition(position);
		// this.sprite = compositeSprite;

		this.setSprite(10, 10, 'zombiVioletWalk');


		this.translation = new Translation();
		this.bloodDropping = new BloodDropping();
		this.hitable = new Hitable(map);
		this.playerFinder = new PlayerFinder(this.entitieToReach, map, 1.5);
		this.playerFinder.evt.addEventListener('LOST', this, this.onLostPlayer);

		this.nextUpdateDirectionStepDelay = 0;

		this.zombieMove = new Move(0.2, this.position, map);
		this.zombieMove.evt.addEventListener('REACH', this, this.onReachDestination);
	}

	removeSpriteLayer(name) {
		this.sprite.removeSprite(name);
	}

	onLostPlayer() {
		// this.entity.setState('WALK');
	}

	setEntity(entity) {
		super.setEntity(entity);
		this.bloodDropping.setEntity(this.entity);
		this.hitable.setEntity(this.entity);
		this.playerFinder.init(this.entity);
	}
	
	start() {
		super.start();
		this.hitable.enable();
		CollisionResolver.checkCollisionWithLayer(this, 'PLAYER');
		this.zombieMove.setDestination(this.entitieToReach.position.x, this.entitieToReach.position.y)
		this.playerFinder.update(this.position, this.zombieMove.moveTranslation);
		this.sprite.textureAnimation.evt.addEventListener(ANIMATION_END_EVENT, this, this.#playStepSound);
		this.changeDirection(0);
	}

	onCollide(collisions, layersName) {
		switch (layersName) {
			case 'PLAYER':
				this.#onPlayerTouch(collisions);
			break;
		}
	}

	#playStepSound() {
			if (this.entity.isViewableByPlayer === false) {
				return;
			}
	
			this.entity.playSound(['zombieStepA', 'zombieStepB', 'zombieStepC']);
		}

	#onPlayerTouch(players) {
		CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
		this.entity.setState('ATTACK', this.entitieToReach);
    }

	changeDirection(step) {
		Stepper.stopListenStep(Stepper.curStep, this, this.changeDirection);
		this.zombieMove.setDestination(this.playerFinder.lastViewPosition.x, this.playerFinder.lastViewPosition.y)
		this.nextUpdateDirectionStepDelay = Stepper.curStep + Math.round(MATH.randomValue(10, 120));
		Stepper.listenStep(this.nextUpdateDirectionStepDelay, this, this.changeDirection);
	}

	suspend() {
		this.sprite.textureAnimation.evt.removeEventListener(ANIMATION_END_EVENT, this, this.#playStepSound);
		Stepper.stopListenStep(this.nextUpdateDirectionStepDelay, this, this.changeDirection);
		this.hitable.disable();
		CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
		super.suspend();
	}

	update(step, time) {
		super.update(step, time);
		this.bloodDropping.update(step, this.position);
		this.playerFinder.update(this.position, this.zombieMove.moveTranslation);
		this.zombieMove.update();
		this.sprite.setRotation(this.zombieMove.moveTranslation.angle);
	}

	onReachDestination() {
		const distanceToLastPlayerPosition = MATH.distance(this.playerFinder.lastViewPosition, this.position);

		if (distanceToLastPlayerPosition < 2) {
			this.entity.setState('PAUSE_AND_SEARCH', this.zombieMove.moveTranslation.angle);
			return;
		}
		
		this.changeDirection();
	}

	takeDamage(vector, damageCount, remainingLife) {
		this.hitable.hit(damageCount, this.position, vector, remainingLife);
		this.entity.setState('SLIDE', vector);
	}

	dispose() {
		this.sprite.textureAnimation.evt.removeEventListener(ANIMATION_END_EVENT, this, this.#playStepSound);
		CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
		Stepper.stopListenStep(this.nextUpdateDirectionStepDelay, this, this.changeDirection);
		this.zombieMove.evt.removeEventListener('REACH', this, this.onReachDestination);
		this.playerFinder.evt.removeEventListener('LOST', this, this.onLostPlayer);
		this.hitable.dispose();
		super.dispose();
	}
}

export {StateFollow as default};