import Evt from './utils/event.js';
import * as AnimationControl from './animationControl.js';
import {
	PLAYER_POSITION_X,
} from './map/map.js';
import Hitbox from './collisionHitbox.js';
import * as Particules from './particules.js';
import CollisionResolver from './collisionResolver.js';
import EntityWithStates from './entityWithStates.js'
import * as SoundLoader from './net/loaderSound.js';
import {
	StateFollowEntitie,
	StateSlide,
	StateTravelCells,
} from './states.js';
import {
	randomValue,
} from './utils/misc.js';

export const DISPOSE_EVENT = 'DISPOSE_EVENT';
export const ON_GROUND_EVENT = 'ON_GROUND_EVENT';

export class Zombi extends EntityWithStates{

	constructor(states) {
		super(states);
		this.pointValue = 10;
		this.life = 2;
		this.evt = new Evt();
	}

	getWorldCollisionBox() {
		return this.currentState.getWorldCollisionBox();
	}

	takeDamage(vector) {
		this.currentState.takeDamage(vector);
	}

	dispose() {
		super.dispose();
		this.evt.fireEvent(DISPOSE_EVENT, this);
	}
}


export class ZombiStateTravelCells extends StateTravelCells {
	constructor(position, cellRoot) {
		super(position, cellRoot, 0.2);
		this.id = 'ENTER';
		this.hitBox = new Hitbox(-2, 2, -2, 4, true);
		this.bloodModulo = 2;
	}

	start() {
		CollisionResolver.addToLayer(this.entity, 'ENNEMIES');
		this.setSprite(8, 8, 'zombiWalk');
		super.start();
	}

	suspend() {
		this.sprite.dispose();
	}

	update(step, time) {
		super.update(step, time);
		this.#dropBlood(step);
	}

	#dropBlood(time) {
		if (this.entity.life !== 1) {
			return;
		}
		if (time % this.bloodModulo !== 0) {
			return;
		}

		Particules.create(Particules.BLOOD_WALK, this.position);

		this.bloodModulo = Math.round(randomValue(2, 60));
	}

	takeDamage(vector) {
		this.entity.life --;
		SoundLoader.playRandom(['wolfGruntA', 'wolfGruntB']);
		CollisionResolver.removeFromLayer(this.entity, 'ENNEMIES');

		this.entity.setState('SLIDE', vector);
	}

	dispose() {
		CollisionResolver.removeFromLayer(this.entity, 'ENNEMIES');
		this.hitBox.dispose();
		super.dispose();
	}
}

export class ZombiStateFollow extends StateFollowEntitie {
	constructor(position, player) {
		super(position, player, 0.2);
		this.id = 'ENTER';
		this.hitBox = new Hitbox(-2, 2, -2, 4, true);
		this.bloodModulo = 2;
	}
	
	start() {
		CollisionResolver.addToLayer(this.entity, 'ENNEMIES');
		this.setSprite(8, 8, 'zombiWalk');
		super.start();
	}

	suspend() {
		this.sprite.dispose();
	}

	update(step, time) {
		super.update(step, time);
		this.#dropBlood(step);
	}

	getNextUpdateDirectionStepDelay() {
		return Math.round(randomValue(10, 120));
	}

	#dropBlood(time) {
		if (this.entity.life !== 1) {
			return;
		}
		if (time % this.bloodModulo !== 0) {
			return;
		}

		Particules.create(Particules.BLOOD_WALK, this.position);

		this.bloodModulo = Math.round(randomValue(2, 60));
	}

	onReachDestination() {
		super.onReachDestination();
		this.entity.dispose();
	}

	takeDamage(vector) {
		this.entity.life --;
		SoundLoader.playRandom(['wolfGruntA', 'wolfGruntB']);
		// this.entity.dispose();
		// this.dispose();
		CollisionResolver.removeFromLayer(this.entity, 'ENNEMIES');

		this.entity.setState('SLIDE', vector);
	}

	dispose() {
		CollisionResolver.removeFromLayer(this.entity, 'ENNEMIES');
		this.hitBox.dispose();
		super.dispose();
	}
}

export class ZombiStateSlide extends StateSlide {
	constructor(position) {
		super(position);
		this.id = 'SLIDE';
	}

	start(vector) {
		const params = {
			velocityX: vector.x,
			velocityY: vector.y,
			friction: 0.85,
		}
		this.setSprite(8, 8, 'zombiHit');
		super.start(params);
	}

	suspend() {
		this.sprite.dispose();
	}
	
	onStop() {
		// this.entity.setState('ENTER');
		if (this.entity.life === 0) {
			this.entity.dispose();
			this.dispose();
			return;
		}

		this.entity.setState('ENTER');
	}
}


