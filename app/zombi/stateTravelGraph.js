import * as SoundLoader from '../net/loaderSound.js';
import * as SpriteFactory from '../spriteFactory.js';

import {
	ANIMATION_END_EVENT,
} from '../textureAnimation.js';
import BloodDropping from './bloodDropping.js';
import { CompositeSprite } from '../sprite.js';
import Hitable from './hitable.js';
import {Hitbox} from '../collisionHitbox.js';
import Move from './move.js';
import PlayerFinder from './playerFinder.js';
import { State } from '../states.js';
import Translation from '../translation.js';

class StateTravelGraph extends State {
	constructor(position, map, player) {
		super(position);
		this.map = map;

		this.setHitBox(new Hitbox(-3, 3, -3, 3, true));
		
		this.travelPoints = [];


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
		// this.setSprite(8, 8, 'zombiWalk');

		this.translation = new Translation();

		this.zombieMove = new Move(0.1, this.position, map);
		this.zombieMove.evt.addEventListener('REACH', this, this.updateDirection);
		this.zombieMove.evt.addEventListener('BLOCKED', this, this.onPathBlocked);

		this.bloodDropping = new BloodDropping();
		this.hitable = new Hitable(map);
		this.playerFinder = new PlayerFinder(player, this.map, 1.5);
		this.playerFinder.evt.addEventListener('VIEW', this, this.onViewPlayer);

		this.test = 0;
		this.newStepPlaySound = 0;
	}

	removeSpriteLayer(name) {
		this.sprite.removeSprite(name);
	}

	setEntity(entity) {
		super.setEntity(entity);
		this.bloodDropping.setEntity(this.entity);
		this.hitable.setEntity(this.entity);
		this.playerFinder.init(this.entity);
	}
	
	start() {
		this.test = 0;
		this.hitable.enable();
		this.travelPoints = [];
		this.#getJourney();
		this.updateDirection();
		// this.#playStepSound();
		this.sprite.textureAnimation.evt.addEventListener(ANIMATION_END_EVENT, this, this.#playStepSound);
		super.start();
	}

	suspend() {
		this.sprite.textureAnimation.evt.removeEventListener(ANIMATION_END_EVENT, this, this.#playStepSound);
		// Stepper.stopListenStep(this.newStepPlaySound, this, this.#playStepSound);
		this.hitable.disable();
		super.suspend();
	}

	update(step, time) {
		this.bloodDropping.update(step, this.position);
		this.zombieMove.update();
		this.playerFinder.update(this.position, this.zombieMove.moveTranslation);
		this.sprite.setRotation(this.zombieMove.moveTranslation.angle);
		super.update(step, time);
	}

	onViewPlayer() {
		this.entity.playSound(['zombieMoanA', 'zombieMoanB']);
		this.entity.setState('FOLLOW');
	}

	takeDamage(vector, damageCount, remainingLife) {		
		this.hitable.hit(damageCount, this.position, vector, remainingLife);
		this.entity.setState('SLIDE', vector);
	}

	#playStepSound() {
		if (this.entity.isViewableByPlayer === false) {
			return;
		}

		this.entity.playSound(['zombieStepA', 'zombieStepB', 'zombieStepC']);
	}

	onPathBlocked() {
		console.log('onPathBlocked');
		this.#getJourney();
	}

	#getJourney() {
		this.test ++;
		const destCell = this.map.getRandomCell();
		const destPos = destCell.center;
		// const destPos = {x: 70, y: 15};
		this.travelPoints = this.map.getTravel(this.position, destPos);

	}
	
	updateDirection() {
		if (this.test > 1) {
			this.entity.setState('PAUSE_AND_SEARCH', this.zombieMove.moveTranslation.angle);
			return;
		}

		if (this.travelPoints.length === 0) {
			this.#getJourney();
		}

		const nextPoint = this.travelPoints.pop();
		this.zombieMove.setDestination(nextPoint.x, nextPoint.y);
	}

	dispose() {
		this.sprite.textureAnimation.evt.removeEventListener(ANIMATION_END_EVENT, this, this.#playStepSound);
		// Stepper.stopListenStep(this.newStepPlaySound, this, this.#playStepSound);
		this.zombieMove.evt.removeEventListener('REACH', this, this.updateDirection);
		this.zombieMove.evt.removeEventListener('BLOCKED', this, this.onPathBlocked);
		this.playerFinder.evt.removeEventListener('VIEW', this, this.onViewPlayer);
		this.hitable.dispose();
		super.dispose();
	}
}

export {StateTravelGraph as default};