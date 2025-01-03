import * as MATH from '../utils/math.js';
import * as SoundLoader from '../net/loaderSound.js';

import {DISPOSE_EVENT} from '../map/map.js';
import EntityWithStates from '../entityWithStates.js'
import Evt from '../utils/event.js';
import StateAttack from './stateAttack.js'
import StateFollow from './stateFollow.js'
import StateHole from './stateHole.js'
import StatePauseAndSearch from './statePauseAndSearch.js'
import StateSlide from './stateSlide.js'
import StateStillGuard from './stateStillGuard.js'
import StateTravelGraph from './stateTravelGraph.js'
import Translation from '../translation.js';
import {getCurrentLevel} from '../gameLevel.js';

export const pool = new Map();

export function createZombi(id, player, map, startPosition, firstState) {
	const zombiStates = new Map();
	zombiStates.set('ENTER', new StateHole(startPosition));
	zombiStates.set('WALK', new StateTravelGraph(startPosition, map, player));
	zombiStates.set('STILL_GUARD', new StateStillGuard(startPosition, map, player));
	zombiStates.set('FOLLOW', new StateFollow(startPosition, player, map));
	zombiStates.set('SLIDE', new StateSlide(startPosition, map));
	zombiStates.set('ATTACK', new StateAttack(startPosition, map));
	zombiStates.set('PAUSE_AND_SEARCH', new StatePauseAndSearch(startPosition, map, player));
	const zombi = new Zombi(id, zombiStates, map, startPosition, player, firstState);
	pool.set(zombi, zombi);
	return zombi;
}

export class Zombi extends EntityWithStates{

	constructor(id, states, map, position, player, firstState) {
		super(states, firstState);
		this.id = id;
		this.evt = new Evt();
		this.map = map;
		this.position = position;
		this.targetPlayer = player;
		this.life = 3;
		this.hitCooldown = 0;
		this.translationToPlayer = new Translation();
		this.translationToPlayer.reset(this.position.x, this.position.y);
		this.isViewableByPlayer = false;

		this.map.evt.addEventListener(DISPOSE_EVENT, this, this.dispose);
	}

	update(step, time) {
		super.update(step, time);
		this.#updatePlayerRelation();

		this.hitCooldown = Math.max(0, this.hitCooldown - 1);

		if (this.life <= 0) {
			getCurrentLevel().persist('ZOMBIE_DIE', this);
			this.dispose();
		}
	}

	#updatePlayerRelation() {
		this.translationToPlayer.update(
			this.position.x,
			this.position.y,
			this.targetPlayer.position.x,
			this.targetPlayer.position.y
		);

		const wallBetweenPlayer = this.map.getWallsIntersections(this.translationToPlayer).pop();
		
		// Le probleme de ça c'est que ça calcul en fonction du point central, pas de la hitbox englobante
		this.isViewableByPlayer = true;
		
		if (wallBetweenPlayer) {
			this.isViewableByPlayer = false;
		}
	}

	playSound(soundList) {
		const volume = 1 - (this.translationToPlayer.length * 0.01);
		if (volume < 0) {
			return;
		}
		SoundLoader.playRandom(soundList, volume);
	}

	getPosition() {
		return this.currentState.position;
	}

	getWorldCollisionBox() {
		return this.currentState.getWorldCollisionBox();
	}

	getLightCollisionBox() {
		return this.currentState.getLightCollisionBox();
	}

	takeDamage(vector, damageCount) {
		if (this.hitCooldown > 0) {
			return;
		}
		
		// this.removeSpriteLayer();
		this.hitCooldown = 10;
		this.life -= damageCount;
		this.currentState.takeDamage(vector, damageCount, this.life);

	}

	removeSpriteLayer() {
		const roundLife = Math.ceil(this.life + 1);
		this.states.forEach(state => state.removeSpriteLayer(`life${roundLife}`));
	}

	dispose() {
		super.dispose();
		pool.delete(this);
		this.map.evt.removeEventListener(DISPOSE_EVENT, this, this.dispose);
	}
}






