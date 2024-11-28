import Evt from './utils/event.js';
import * as AnimationControl from './animationControl.js';
import {
	PLAYER_POSITION_X,
} from './map/map.js';
import Interval from './utils/interval.js';
import Hitbox from './collisionHitbox.js';
import Translation from './translation.js';
import * as Particules from './particules.js';
import CollisionResolver from './collisionResolver.js';
import EntityWithStates from './entityWithStates.js'
import * as SoundLoader from './net/loaderSound.js';
import * as Debug from './debugCanvas.js';
import * as Stepper from './utils/stepper.js';
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

export function createZombi(player, map, startPosition) {
	const zombiStates = new Map();
	zombiStates.set('ENTER', new ZombiStateTravelGraph(startPosition, map, player));
	zombiStates.set('FOLLOW', new ZombiStateFollow(startPosition, player, map));
	zombiStates.set('SLIDE', new ZombiStateSlide(startPosition, map));
	zombiStates.set('PAUSE_AND_SEARCH', new ZombiPauseAndSearch(startPosition, map, player));
	const zombi = new Zombi(zombiStates);
}

export class Zombi extends EntityWithStates{

	constructor(states) {
		super(states);
		this.pointValue = 10;
		this.life = 2;
		this.evt = new Evt();

		pool.set(this, this);
	}

	getPosition() {
		return this.currentState.position;
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
		if (this.entity.life > 1) {
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
		console.warn('HIT', damageCount, this.entity.life);
		this.entity.life -= damageCount;
		// SoundLoader.playRandom(['wolfGruntA', 'wolfGruntB'], 0.5);

		Particules.createBloodSplat(this.entity.currentState.position)

		setTimeout(() => SoundLoader.playRandom(['wolfGruntA', 'wolfGruntB']), 100);
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
		// this.translation = new Translation();
		this.viewTranslation = new Translation();
	}
	
	init(entity, position, onViewFunction) {
		this.entity = entity;
		this.onViewFunction = onViewFunction;
		// this.translation.reset(position.x, position.y)
	}

	update(position, translation) {
		// this.translation.updatePosition(position.x, position.y);
		
		const angleToPlayer = MATH.pointsAngle(
			[position.x, position.y],
			[this.player.position.x, this.player.position.y]
		);
		
		const viewAngle = Math.abs(MATH.angleDiff(angleToPlayer, translation.angle));

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

class ZombieMove {
	constructor(moveSpeed, position) {
		this.moveSpeed = moveSpeed;
		this.position = position;
		this.moveTranslation = new Translation();
		this.destX = 0;
		this.destY = 0;
		this.evt = new Evt();
	}

	setDestination(x, y) {
		this.destX = x;
		this.destY = y;
		this.moveTranslation.angle = MATH.pointsAngle([this.position.x, this.position.y], [this.destX, this.destY]);
	}

	update() {
		const translationX = Math.cos(this.moveTranslation.angle);
		const translationY = Math.sin(this.moveTranslation.angle);

		const newX = this.position.x + translationX * this.moveSpeed;
		const newY = this.position.y + translationY * this.moveSpeed;
		
		this.moveTranslation.update(this.position.x, this.position.y, newX, newY);

		this.position.x = newX; 
		this.position.y = newY; 

		const distanceFromTargetX = this.destX - this.position.x;
		const distanceFromTargetY = this.destY - this.position.y;
		const distanceFromTargetTotal = Math.abs(distanceFromTargetX) + Math.abs(distanceFromTargetY);

		if (distanceFromTargetTotal < 1) {
			this.evt.fireEvent('REACH');
		}
	}
}

export class ZombiStateTravelGraph extends State {
	constructor(position, map, player) {
		super(position);
		this.map = map;

		this.setHitBox(new Hitbox(-3, 3, -3, 3, true));
		
		this.travelPoints = [];
		this.setSprite(8, 8, 'zombiWalk');

		this.translation = new Translation();

		this.zombieMove = new ZombieMove(0.1, this.position);
		this.zombieMove.evt.addEventListener('REACH', this, this.updateDirection);

		this.bloodDropping = new BloodDropping();
		this.zombiHitable = new ZombiHitable();
		this.playerFinder = new PlayerFinder(player, this.map);
		this.playerFinder.evt.addEventListener('VIEW', this, this.onViewPlayer);

		this.test = 0;
	}

	setEntity(entity) {
		super.setEntity(entity);
		this.bloodDropping.setEntity(this.entity);
		this.zombiHitable.setEntity(this.entity);
		this.playerFinder.init(this.entity, this.position);
	}
	
	start() {
		this.test = 0;
		this.zombiHitable.enable();
		this.travelPoints = [];
		this.#getJourney();
		this.updateDirection();
		super.start();
	}

	suspend() {
		this.zombiHitable.disable();
		super.suspend();
	}

	update(step, time) {
		this.bloodDropping.update(step, this.position);
		this.zombieMove.update();
		this.playerFinder.update(this.position, this.zombieMove.moveTranslation);
		this.sprite.setRotation(this.zombieMove.moveTranslation.angle);
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
		this.test ++;
		const destCell = this.map.getRandomCell();
		// const destCell = this.map.getCellByPosition(-20, 0);
		const destPos = destCell.center;
		this.travelPoints = this.map.getTravel(this.position, destPos);
		Debug.drawJourney([...this.travelPoints]);

	}
	
	updateDirection() {
		if (this.test > 1) {
			console.log('PAUSE');
			this.entity.setState('PAUSE_AND_SEARCH');
			return;
		}

		if (this.travelPoints.length === 0) {
			this.#getJourney();
		}

		const nextPoint = this.travelPoints.pop();
		this.zombieMove.setDestination(nextPoint.x, nextPoint.y);
	}

	dispose() {
		this.zombiHitable.dispose();
		super.dispose();
	}
}

export class ZombiStateFollow extends State {
	constructor(position, player, map) {
		super(position);
		this.entitieToReach = player;

		this.setHitBox(new Hitbox(-3, 3, -3, 3, true));
		this.setSprite(8, 8, 'zombiWalk');
		this.translation = new Translation();
		this.bloodDropping = new BloodDropping();
		this.zombiHitable = new ZombiHitable();
		this.playerFinder = new PlayerFinder(player, map);
		this.playerFinder.evt.addEventListener('LOST', this, this.onLostPlayer);

		this.zombieMove = new ZombieMove(0.2, this.position);
		this.zombieMove.evt.addEventListener('REACH', this, this.onReachDestination);
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
		super.start();
		this.zombiHitable.enable();
		this.updateDirection(0);
	}

	updateDirection(step) {
		this.zombieMove.setDestination(this.entitieToReach.position.x, this.entitieToReach.position.y)

		const nextUpdateDirectionStepDelay = Math.round(randomValue(10, 120));
		Stepper.stopListenStep(step, this, this.updateDirection);
		Stepper.listenStep(Stepper.curStep + nextUpdateDirectionStepDelay, this, this.updateDirection);
	}

	suspend() {
		this.zombiHitable.disable();
		super.suspend();
	}

	update(step, time) {
		super.update(step, time);
		this.bloodDropping.update(step, this.position);
		this.playerFinder.update(this.position, this.zombieMove.moveTranslation);
		this.zombieMove.update();
		this.sprite.setRotation(this.zombieMove.moveTranslation.angle);
	}

	onReachDestination() {
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
		this.zombiHitable = new ZombiHitable();
		this.setSprite(8, 8, 'zombiHit');
	}

	setEntity(entity) {
		super.setEntity(entity);
		this.zombiHitable.setEntity(this.entity);
	}

	start(vector) {
		const params = {
			velocityX: vector.x,
			velocityY: vector.y,
			friction: 0.85,
		}
		super.start(params);
		this.zombiHitable.enable();
	}

	onStop() {
		if (this.entity.life <= 0) {
			console.log('onStop');
			this.entity.dispose();
			return;
		}

		this.entity.setState('ENTER');
	}

	suspend() {
		this.zombiHitable.disable();
		super.suspend();
	}

	takeDamage(vector, damageCount) {
		console.log('damageCount', damageCount);
		this.zombiHitable.hit(damageCount);
		this.slide({
			velocityX: vector.x,
			velocityY: vector.y,
			friction: 0.85,
		});
	}

	dispose() {
		this.zombiHitable.dispose();
		super.dispose();
	}
}


export class ZombiPauseAndSearch extends State {
	constructor(position, map, player) {
		super(position);
		this.setSprite(8, 8, 'zombiWalk');

		this.playerFinder = new PlayerFinder(player, map);
		this.playerFinder.evt.addEventListener('VIEW', this, this.onViewPlayer);

		this.zombiHitable = new ZombiHitable();

		this.translation = new Translation();
		this.rotationDirection = MATH.randomDirection(0.02);
		this.stopSearchStep = 0
	}

	setEntity(entity) {
		super.setEntity(entity);
		this.playerFinder.init(this.entity, this.position);
		this.zombiHitable.setEntity(this.entity);
	}

	start() {
		super.start();
		this.translation.angle = this.sprite.getRotation();
		
		this.stopSearchStep = Stepper.curStep + Math.round(MATH.random(120, 600));
		
		this.zombiHitable.enable();
		Stepper.listenStep(this.stopSearchStep, this, this.onStopSearch);
	}
	
	onStopSearch() {
		Stepper.stopListenStep(this.stopSearchStep, this, this.onStopSearch);
		this.entity.setState('FOLLOW');
	}

	update(step, time) {
		super.update(step, time);
		this.#turn();
		this.playerFinder.update(this.position, this.translation);
	}

	suspend() {
		this.zombiHitable.disable();
		super.suspend();
	}

	#turn() {
		this.translation.angle += this.rotationDirection;
		this.sprite.setRotation(this.translation.angle);
	}

	onViewPlayer() {
		this.entity.setState('FOLLOW');
	}

	takeDamage(vector, damageCount) {
		this.zombiHitable.hit(damageCount);
		this.entity.setState('SLIDE', vector);
	}

	dispose() {
		this.zombiHitable.dispose();
		Stepper.stopListenStep(this.stopSearchStep, this, this.onStopSearch);
		super.dispose();
	}
}


