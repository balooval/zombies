import * as Particules from '../particules.js';
import { randomValue } from '../utils/math.js';

class BloodDropping {

	constructor(entity) {
		this.entity = entity;
		this.bloodModulo = 2;
	}

	setEntity(entity) {
		this.entity = entity;
	}

	update(step, position) {
		this.#dropBlood(step, position);
	}

	#dropBlood(step, position) {
		if (this.entity.life > 1) {
			return;
		}

		if (step % this.bloodModulo !== 0) {
			return;
		}

		Particules.create(Particules.BLOOD_WALK, position);

		this.bloodModulo = Math.round(randomValue(2, 60));
	}
}

export {BloodDropping as default};