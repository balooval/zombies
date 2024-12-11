import * as Particules from '../particules.js';
import * as SoundLoader from '../net/loaderSound.js';

import CollisionResolver from '../collisionResolver.js';

class Hitable {

	constructor(map) {
		this.map = map;
		this.entity = null;
	}

	setEntity(entity) {
		this.entity = entity;
	}

	enable() {
		CollisionResolver.addToLayer(this.entity, 'ENNEMIES');
	}

	disable() {
		CollisionResolver.removeFromLayer(this.entity, 'ENNEMIES');
	}
	
	hit(damageCount, position, vector) {
		// Particules.createBloodSplat(this.entity.currentState.position)
		setTimeout(() => SoundLoader.playRandom(['wolfGruntA', 'wolfGruntB']), 100);

		this.map.spreadBlood(position.x, position.y, damageCount, vector);
	}

	dispose() {
		CollisionResolver.removeFromLayer(this.entity, 'ENNEMIES');
	}
}

export {Hitable as default};