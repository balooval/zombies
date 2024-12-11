import EntityWithStates from '../entityWithStates.js'
import StateAttack from './stateAttack.js'
import StateFollow from './stateFollow.js'
import StateHole from './stateHole.js'
import StatePauseAndSearch from './statePauseAndSearch.js'
import StateSlide from './stateSlide.js'
import StateTravelGraph from './stateTravelGraph.js'

export const pool = new Map();

export function createZombi(player, map, startPosition) {
	const zombiStates = new Map();
	zombiStates.set('ENTER', new StateHole(startPosition));
	zombiStates.set('WALK', new StateTravelGraph(startPosition, map, player));
	zombiStates.set('FOLLOW', new StateFollow(startPosition, player, map));
	zombiStates.set('SLIDE', new StateSlide(startPosition, map));
	zombiStates.set('ATTACK', new StateAttack(startPosition, map));
	zombiStates.set('PAUSE_AND_SEARCH', new StatePauseAndSearch(startPosition, map, player));
	const zombi = new Zombi(zombiStates, map);
	pool.set(zombi, zombi);
}

export class Zombi extends EntityWithStates{

	constructor(states, map) {
		super(states);
		this.map = map;
		this.life = 3;
		this.hitCooldown = 0;
	}

	update(step, time) {
		super.update(step, time);

		this.hitCooldown = Math.max(0, this.hitCooldown - 1);

		if (this.life <= 0) {
			this.dispose();
		}
	}

	getPosition() {
		return this.currentState.position;
	}

	getWorldCollisionBox() {
		return this.currentState.getWorldCollisionBox();
	}

	takeDamage(vector, damageCount) {
		if (this.hitCooldown > 0) {
			return;
		}
		
		// this.removeSpriteLayer();
		this.hitCooldown = 10;
		this.life -= damageCount;
		this.currentState.takeDamage(vector, damageCount);

	}

	removeSpriteLayer() {
		const roundLife = Math.ceil(this.life + 1);
		this.states.forEach(state => state.removeSpriteLayer(`life${roundLife}`));
	}

	dispose() {
		super.dispose();
		pool.delete(this);
	}
}






