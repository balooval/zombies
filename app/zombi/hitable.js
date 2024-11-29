import CollisionResolver from '../collisionResolver.js';
import * as Particules from '../particules.js';
import * as SoundLoader from '../net/loaderSound.js';

class Hitable {

	constructor(entity) {
		this.entity = entity;
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
	
	hit(damageCount) {
		Particules.createBloodSplat(this.entity.currentState.position)
		setTimeout(() => SoundLoader.playRandom(['wolfGruntA', 'wolfGruntB']), 100);
	}

	dispose() {
		CollisionResolver.removeFromLayer(this.entity, 'ENNEMIES');
	}
}

export {Hitable as default};