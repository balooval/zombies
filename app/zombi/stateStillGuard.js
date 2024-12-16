import * as MATH from '../utils/math.js';

import Hitable from './hitable.js';
import PlayerFinder from './playerFinder.js';
import {State} from '../states.js';
import Translation from '../translation.js';

class StateStillGuard extends State {
	constructor(position, map, player) {
		super(position);
		this.setSprite(10, 10, 'zombiVioletStill');

		this.translation = new Translation();
		this.hitable = new Hitable(map);
		this.playerFinder = new PlayerFinder(player, map, 1.5);
		this.playerFinder.evt.addEventListener('VIEW', this, this.onViewPlayer);
		this.rotationAmplitude = 0;
		this.rotationTime = 0;

	}

	setEntity(entity) {
		super.setEntity(entity);
		this.playerFinder.init(this.entity);
		this.hitable.setEntity(this.entity);
	}

	start() {
		super.start();
		this.rotationTime = 0;
		this.baseAngle = MATH.randomFloat(-3.14, 3.15);
		this.rotationAmplitude = MATH.randomValue(0.5, 1);
		this.sprite.setRotation(this.baseAngle);
		this.translation.angle = this.baseAngle;
		this.hitable.enable();
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
		this.rotationTime += 0.01;
		this.translation.angle = this.baseAngle + Math.cos(this.rotationTime) * this.rotationAmplitude;
		this.sprite.setRotation(this.translation.angle);
	}

	onViewPlayer() {
		this.entity.setState('FOLLOW');
	}

	takeDamage(vector, damageCount, remainingLife) {
		this.hitable.hit(damageCount, this.position, vector, remainingLife);
		this.entity.setState('SLIDE', vector);
	}

	dispose() {
		this.playerFinder.evt.removeEventListener('VIEW', this, this.onViewPlayer);
		this.hitable.dispose();
		super.dispose();
	}
}

export {StateStillGuard as default};