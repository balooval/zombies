import Evt from './utils/event.js';
import * as AnimationControl from './animationControl.js';
import {
	PLAYER_POSITION_X,
} from './map/map.js';
import Hitbox from './collisionHitbox.js';
import CollisionResolver from './collisionResolver.js';
import WolfFallDead from './wolfFallDead.js';
import WolfLadder from './wolfLadder.js';
import Stone from './stone.js';
import * as SoundLoader from './net/loaderSound.js';
import * as Stepper from './utils/stepper.js';
import EntityWithStates from './entityWithStates.js'
import {
	StateMoveOnX,
	StateMoveOnY,
} from './states.js';

export const DISPOSE_EVENT = 'DISPOSE_EVENT';
export const ON_GROUND_EVENT = 'ON_GROUND_EVENT';

export class Wolf extends EntityWithStates{

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

export class WolfStateEnter extends StateMoveOnX {
	constructor(position, fallPosition) {
		super(position, fallPosition, 25);
		this.id = 'ENTER';
	}

	start() {
		this.setSprite(8, 8, 'wolfWalk');
		super.start();
	}
	
	onReachDestination() {
		super.onReachDestination();
		this.entity.setState('FALL');
	}

	takeDamage() {}
}

export class WolfStateExit extends StateMoveOnX {
	constructor(position, goalPosition) {
		super(position, goalPosition, 20);
		this.id = 'EXIT';
	}
	
	start() {
		this.entity.evt.fireEvent(ON_GROUND_EVENT, this.entity);
		this.setSprite(8, 8, 'wolfWalk');
		super.start();
	}

	onReachDestination() {
		const wolfLadder = new WolfLadder(this.position);
		super.onReachDestination();
		this.entity.dispose();
	}

	takeDamage() {}
}

export class WolfStateFall extends StateMoveOnY {
	constructor(position, groundPosition) {
		super(position, groundPosition, 60);
		this.id = 'FALL';
		this.launchStoneStep = 0;
	}
	
	start() {
		CollisionResolver.addToLayer(this.entity, 'ENNEMIES');
		this.launchStoneStep = Stepper.curStep + 20 + (Math.random() * 230);
		Stepper.listenStep(this.launchStoneStep, this, this.launchProjectile);
		super.start();
	}

	launchProjectile() {
		const distanceToPlayer = PLAYER_POSITION_X - this.position.x;
		const velocityX = Math.max(0.6, distanceToPlayer / 50);
		const velocityY = Math.max(0.4, distanceToPlayer / 100);
		const stone = new Stone(
			this.position.x,
			this.position.y,
			velocityX,
			velocityY
		);
	}

	onReachDestination() {
		this.entity.setState('EXIT');
		super.onReachDestination();
	}

	dispose() {
		super.dispose();
		Stepper.stopListenStep(this.launchStoneStep, this, this.launchProjectile);
		CollisionResolver.removeFromLayer(this.entity, 'ENNEMIES');
	}

}

export class WolfStateFallLife1 extends WolfStateFall {
	start() {
		this.hitBox = new Hitbox(-2, 2, -2, 4, true);
		this.setSprite(10, 10, 'wolfFall');
		super.start();
	}

	takeDamage() {
		SoundLoader.playRandom(['wolfGruntA', 'wolfGruntB']);
		const wolfFallDead = new WolfFallDead(this.position);
		this.entity.dispose();
		this.dispose();
	}
}

export class WolfStateFallLife2 extends WolfStateFall {
	start() {
		this.hitBox = new Hitbox(-2, 2, -1, 5, true);
		this.setSprite(10, 10, 'wolfFallLevel2');
		super.start();
	}

	takeDamage() {
		this.dispose();
		this.entity.setState('FALL1');
	}
}
