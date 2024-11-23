import Evt from './utils/event.js';
import * as AnimationControl from './animationControl.js';
import {
	PLAYER_POSITION_X,
} from './map/map.js';
import Hitbox from './collisionHitbox.js';
import CollisionResolver from './collisionResolver.js';
import EntityWithStates from './entityWithStates.js'
import * as SoundLoader from './net/loaderSound.js';
import {
	StateReachEntitie,
} from './states.js';

export const DISPOSE_EVENT = 'DISPOSE_EVENT';
export const ON_GROUND_EVENT = 'ON_GROUND_EVENT';

export class Zombi extends EntityWithStates{

	constructor(states) {
		super(states);
		this.pointValue = 10;
		this.evt = new Evt();
	}

	getWorldCollisionBox() {
		return this.currentState.getWorldCollisionBox();
	}

	takeDamage() {
		this.currentState.takeDamage();
	}

	dispose() {
		super.dispose();
		this.evt.fireEvent(DISPOSE_EVENT, this);
	}
}


export class ZombiStateFollow extends StateReachEntitie {
	constructor(position, player) {
		super(position, player, 0.2);
		this.id = 'ENTER';
	}
	
	start() {
		this.hitBox = new Hitbox(-2, 2, -2, 4, true);
		CollisionResolver.addToLayer(this.entity, 'ENNEMIES');
		this.setSprite(8, 8, 'wolfWalk');
		super.start();
	}

	onReachDestination() {
		console.log('onReachDestination');
		super.onReachDestination();
		// this.entity.dispose();
	}

	takeDamage() {
		SoundLoader.playRandom(['wolfGruntA', 'wolfGruntB']);
		this.entity.dispose();
		this.dispose();
	}

	dispose() {
		CollisionResolver.removeFromLayer(this.entity, 'ENNEMIES');
		this.hitBox.dispose();
		super.dispose();
	}
}
