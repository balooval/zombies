import Evt from './utils/event.js';
import * as AnimationControl from './animationControl.js';
import {
	PLAYER_POSITION_X,
} from './map/map.js';
import Hitbox from './collisionHitbox.js';
import Translation from './translation.js';
import * as Particules from './particules.js';
import CollisionResolver from './collisionResolver.js';
import EntityWithStates from './entityWithStates.js'
import * as SoundLoader from './net/loaderSound.js';
import * as Debug from './debugCanvas.js';
import * as MATH from './utils/math.js';
import { getIntersection } from './intersectionResolver.js';
import {
	State,
	StateFollowEntitie,
	StateSlide,
	StateTravelCells,
} from './states.js';
import {
	randomValue,
} from './utils/misc.js';

export const DISPOSE_EVENT = 'DISPOSE_EVENT';
export const ON_GROUND_EVENT = 'ON_GROUND_EVENT';

export const pool = new Map();

export class Zombi extends EntityWithStates{

	constructor(states) {
		super(states);
		this.pointValue = 10;
		this.life = 2;
		this.evt = new Evt();

		pool.set(this, this);
	}

	getWorldCollisionBox() {
		return this.currentState.getWorldCollisionBox();
	}

	takeDamage(vector, damageCount) {
		this.currentState.takeDamage(vector, damageCount);
	}

	dispose() {
		super.dispose();
		this.evt.fireEvent(DISPOSE_EVENT, this);
		pool.delete(this);
	}
}

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
		if (this.entity.life !== 1) {
			return;
		}

		if (step % this.bloodModulo !== 0) {
			return;
		}

		Particules.create(Particules.BLOOD_WALK, position);

		this.bloodModulo = Math.round(randomValue(2, 60));
	}
}

class ZombiHitable {

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
		this.entity.life -= damageCount;
		SoundLoader.playRandom(['wolfGruntA', 'wolfGruntB']);
	}

	dispose() {
		CollisionResolver.removeFromLayer(this.entity, 'ENNEMIES');
	}
}

class PlayerFinder {
	constructor(player, map) {
		this.player = player;
		this.map = map;
		this.evt = new Evt();
		this.entity = null;
		this.viewAngle = 1.5;
		this.translation = new Translation();
		this.viewTranslation = new Translation();
	}
	
	init(entity, position, onViewFunction) {
		this.entity = entity;
		this.onViewFunction = onViewFunction;
		this.translation.reset(position.x, position.y)
	}

	update(position) {
		this.translation.updatePosition(position.x, position.y);
		
		const angleToPlayer = MATH.pointsAngle(
			[position.x, position.y],
			[this.player.position.x, this.player.position.y]
		);
		
		const viewAngle = Math.abs(MATH.angleDiff(angleToPlayer, this.translation.angle));
		
		if (viewAngle > this.viewAngle) {
			this.evt.fireEvent('LOST');
			return;
		}
		
		this.viewTranslation.reset(position.x, position.y);
		this.viewTranslation.updatePosition(this.player.position.x, this.player.position.y);
		const wallHit = this.map.blocks.map(block => getIntersection(this.viewTranslation, block.hitBox)).filter(res => res).pop();
		
		if (wallHit) {
			this.evt.fireEvent('LOST');
			return;
		}

		this.evt.fireEvent('VIEW');
	}
}

export class ZombiStateTravelGraph extends State {
	constructor(position, map, player) {
		super(position);
		this.moveSpeed = 0.1;
		this.map = map;

		this.setHitBox(new Hitbox(-2, 2, -2, 4, true));
		
		this.distanceFromTargetX = 99999;
		this.distanceFromTargetY = 99999;
		this.distanceFromTargetTotal = 99999;
		this.destX = 0;
		this.destY = 0;
		this.angle = 0;
		// this.bloodModulo = 2;
		this.travelPoints = [];
		this.setSprite(8, 8, 'zombiWalk');

		this.bloodDropping = new BloodDropping();
		this.zombiHitable = new ZombiHitable();
		this.playerFinder = new PlayerFinder(player, this.map);
		this.playerFinder.evt.addEventListener('VIEW', this, this.onViewPlayer);
	}

	setEntity(entity) {
		super.setEntity(entity);
		this.bloodDropping.setEntity(this.entity);
		this.zombiHitable.setEntity(this.entity);
		this.playerFinder.init(this.entity, this.position);
	}
	
	start() {
		this.zombiHitable.enable();
		this.travelPoints = [];
		this.#getJourney();
		this.#updateDirection();
		super.start();
	}

	suspend() {
		this.zombiHitable.disable();
		super.suspend();
	}

	update(step, time) {
		this.#move();
		this.bloodDropping.update(step, this.position);
		this.playerFinder.update(this.position);
		super.update(step, time);
	}

	onViewPlayer() {
		this.entity.setState('FOLLOW');
	}

	takeDamage(vector, damageCount) {
		this.zombiHitable.hit(damageCount);
		this.entity.setState('SLIDE', vector);
	}

	#getJourney() {
		const destCell = this.map.getRandomCell();
		const destPos = destCell.center;
		this.travelPoints = this.map.getTravel(this.position, destPos);
		Debug.drawJourney([...this.travelPoints]);
	}

	#updateDirection() {
		if (this.travelPoints.length === 0) {
			this.#getJourney();
		}

		const nextPoint = this.travelPoints.pop();
		this.destX = nextPoint.x;
		this.destY = nextPoint.y;
		this.angle = Math.atan2(nextPoint.y - this.position.y, nextPoint.x - this.position.x);
		this.sprite.setRotation(this.angle);
	}
	
	#move() {
		const transationX = Math.cos(this.angle);
		const transationY = Math.sin(this.angle);
		this.position.x += transationX * this.moveSpeed; 
		this.position.y += transationY * this.moveSpeed; 
		
		this.distanceFromTargetX = this.destX - this.position.x;
		this.distanceFromTargetY = this.destY - this.position.y;
		this.distanceFromTargetTotal = Math.abs(this.distanceFromTargetX) + Math.abs(this.distanceFromTargetY);

		if (this.distanceFromTargetTotal < 1) {
			this.onReachDestination();
		}
	}

	onReachDestination() {
		this.#updateDirection();
	}

	dispose() {
		this.zombiHitable.dispose();
		super.dispose();
	}
}

export class ZombiStateTravelCells extends StateTravelCells {
	constructor(position, cellRoot) {
		super(position, cellRoot, 0.2);
		this.id = 'ENTER';
		this.setHitBox(new Hitbox(-2, 2, -2, 4, true));
		this.setSprite(8, 8, 'zombiWalk');
		this.zombiHitable = new ZombiHitable();
	}

	setEntity(entity) {
		super.setEntity(entity);
		this.zombiHitable.setEntity(this.entity);
	}

	start() {
		this.zombiHitable.enable();
		super.start();
	}

	suspend() {
		this.zombiHitable.disable();
		super.suspend();
	}

	update(step, time) {
		super.update(step, time);
	}

	takeDamage(vector, damageCount) {
		this.zombiHitable.hit(damageCount);
		this.entity.setState('SLIDE', vector);
	}

	dispose() {
		this.zombiHitable.dispose();
		super.dispose();
	}
}

export class ZombiStateFollow extends StateFollowEntitie {
	constructor(position, player, map) {
		super(position, player, 0.2);
		this.id = 'ENTER';
		this.setHitBox(new Hitbox(-2, 2, -2, 4, true));
		this.setSprite(8, 8, 'zombiWalk');
		this.bloodDropping = new BloodDropping();
		this.zombiHitable = new ZombiHitable();
		this.playerFinder = new PlayerFinder(player, map);
		this.playerFinder.evt.addEventListener('LOST', this, this.onLostPlayer);
	}

	onLostPlayer() {
		this.entity.setState('ENTER');
	}

	setEntity(entity) {
		super.setEntity(entity);
		this.bloodDropping.setEntity(this.entity);
		this.zombiHitable.setEntity(this.entity);
		this.playerFinder.init(this.entity, this.position);
	}
	
	start() {
		this.zombiHitable.enable();
		super.start();
	}

	suspend() {
		this.zombiHitable.disable();
		super.suspend();
	}

	update(step, time) {
		super.update(step, time);
		this.bloodDropping.update(step, this.position);
		this.playerFinder.update(this.position);
	}

	getNextUpdateDirectionStepDelay() {
		return Math.round(randomValue(10, 120));
	}

	onReachDestination() {
		super.onReachDestination();
		this.entity.dispose();
	}

	takeDamage(vector, damageCount) {
		this.zombiHitable.hit(damageCount);
		this.entity.setState('SLIDE', vector);
	}

	dispose() {
		this.zombiHitable.dispose();
		super.dispose();
	}
}

export class ZombiStateSlide extends StateSlide {
	constructor(position, map) {
		super(position, map);
		this.id = 'SLIDE';
		this.setSprite(8, 8, 'zombiHit');
	}

	start(vector) {
		const params = {
			velocityX: vector.x,
			velocityY: vector.y,
			friction: 0.85,
		}
		super.start(params);
	}

	onStop() {
		if (this.entity.life === 0) {
			this.entity.dispose();
			return;
		}

		this.entity.setState('ENTER');
	}
}


