import * as MATH from '../utils/math.js';
import * as Stepper from '../utils/stepper.js';

import Hitable from './hitable.js';
import PlayerFinder from './playerFinder.js';
import {State} from '../states.js';
import Translation from '../translation.js';

class StatePauseAndSearch extends State {
	constructor(position, map, player) {
		super(position);
		this.setSprite(8, 8, 'zombiWalk');

		this.hitable = new Hitable(map);
		this.playerFinder = new PlayerFinder(player, map);
		this.playerFinder.evt.addEventListener('VIEW', this, this.onViewPlayer);

		this.translation = new Translation();
		this.rotationDirection = MATH.randomDirection(0.02);
		this.stopSearchStep = 0
	}

	setEntity(entity) {
		super.setEntity(entity);
		this.playerFinder.init(this.entity);
		this.hitable.setEntity(this.entity);
	}

	start(angle) {
		super.start();
		this.rotationDirection = MATH.randomDirection(0.02);
		this.sprite.setRotation(angle);
		this.translation.angle = this.sprite.getRotation();
		this.stopSearchStep = Stepper.curStep + Math.round(MATH.random(120, 600));
		this.hitable.enable();
		Stepper.listenStep(this.stopSearchStep, this, this.onStopSearch);
	}
	
	onStopSearch() {
		Stepper.stopListenStep(this.stopSearchStep, this, this.onStopSearch);
		this.entity.setState('WALK');
	}

	update(step, time) {
		super.update(step, time);
		this.#turn();
		this.playerFinder.update(this.position, this.translation);
	}

	suspend() {
		this.hitable.disable();
		super.suspend();
	}

	#turn() {
		this.translation.angle += this.rotationDirection;
		this.sprite.setRotation(this.translation.angle);
	}

	onViewPlayer() {
		this.entity.setState('FOLLOW');
	}

	takeDamage(vector, damageCount) {
		this.hitable.hit(damageCount, this.position);
		this.entity.setState('SLIDE', vector);
	}

	dispose() {
		this.playerFinder.evt.removeEventListener('VIEW', this, this.onViewPlayer);
		this.hitable.dispose();
		Stepper.stopListenStep(this.stopSearchStep, this, this.onStopSearch);
		super.dispose();
	}
}

export {StatePauseAndSearch as default};