import {StateSlide as Slide} from '../states.js';
import Hitable from './hitable.js'

class StateSlide extends Slide {
	constructor(position, map) {
		super(position, map);
		this.id = 'SLIDE';
		this.hitable = new Hitable();
		this.setSprite(8, 8, 'zombiHit');
	}

	setEntity(entity) {
		super.setEntity(entity);
		this.hitable.setEntity(this.entity);
	}

	start(vector) {
		const params = {
			velocityX: vector.x,
			velocityY: vector.y,
			friction: 0.85,
		}
		super.start(params);
		this.hitable.enable();
	}

	onStop() {
		super.onStop();
		this.entity.setState('ENTER');
	}

	suspend() {
		this.hitable.disable();
		super.suspend();
	}

	takeDamage(vector, damageCount) {
		this.hitable.hit(damageCount);
		this.slide({
			velocityX: vector.x,
			velocityY: vector.y,
			friction: 0.85,
		});
	}

	dispose() {
		this.hitable.dispose();
		super.dispose();
	}
}

export {StateSlide as default};