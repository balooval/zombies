import * as MATH from '../utils/math.js';
import * as Particules from '../particules.js';
import * as SoundLoader from '../net/loaderSound.js';

import CollisionResolver from '../collisionResolver.js';
import {DeadZombieSprite} from '../fxSprites.js';
import {getCurrentLevel} from '../gameLevel.js';

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
	
	hit(damageCount, position, vector, remainingLife) {
		let soundsList = ['wolfGruntA', 'wolfGruntB', 'zombieHitA'];
		
		if (remainingLife <= 0) {
			soundsList = ['zombieDieA', 'zombieDieB', 'zombieDieC'];
			const animation = MATH.randomElement(['zombiVioletDeadA', 'zombiVioletDeadB']);
			const angle = Math.atan2(vector.y, vector.x);
			new DeadZombieSprite(this.map, position.x, position.y, angle, animation);
			getCurrentLevel().persist('ZOMBIE_CORPSE', {...position, angle, animation});
		}

		setTimeout(() => SoundLoader.playRandom(soundsList), 100);

		this.map.spreadBlood(position.x, position.y, damageCount, vector);
	}

	dispose() {
		CollisionResolver.removeFromLayer(this.entity, 'ENNEMIES');
	}
}

export {Hitable as default};