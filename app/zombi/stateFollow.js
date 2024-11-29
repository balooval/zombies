import * as MATH from '../utils/math.js';
import * as Stepper from '../utils/stepper.js';
import {State} from '../states.js';
import Hitbox from '../collisionHitbox.js';
import Translation from '../translation.js';
import BloodDropping from './bloodDropping.js'
import Hitable from './hitable.js'
import CollisionResolver from './../collisionResolver.js';
import PlayerFinder from './playerFinder.js';
import Move from './move.js';


class StateFollow extends State {
	constructor(position, player, map) {
		super(position);
		this.entitieToReach = player;

		this.setHitBox(new Hitbox(-3, 3, -3, 3, true));
		this.setSprite(8, 8, 'zombiWalk');
		this.translation = new Translation();
		this.bloodDropping = new BloodDropping();
		this.hitable = new Hitable();
		this.playerFinder = new PlayerFinder(player, map);
		this.playerFinder.evt.addEventListener('LOST', this, this.onLostPlayer);

		this.zombieMove = new Move(0.2, this.position);
		this.zombieMove.evt.addEventListener('REACH', this, this.onReachDestination);
	}

	onLostPlayer() {
		this.entity.setState('ENTER');
	}

	setEntity(entity) {
		super.setEntity(entity);
		this.bloodDropping.setEntity(this.entity);
		this.hitable.setEntity(this.entity);
		this.playerFinder.init(this.entity);
	}
	
	start() {
		super.start();
		this.hitable.enable();
		CollisionResolver.checkCollisionWithLayer(this, 'PLAYER');
		this.updateDirection(0);
	}

	onCollide(collisions, layersName) {
		switch (layersName) {
			case 'PLAYER':
				this.#onPlayerTouch(collisions);
			break;
		}
	}

	#onPlayerTouch(players) {
		CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
        const player = players.pop();
		player.hit(this);
		// this.entity.dispose();
    }

	updateDirection(step) {
		this.zombieMove.setDestination(this.entitieToReach.position.x, this.entitieToReach.position.y)

		const nextUpdateDirectionStepDelay = Math.round(MATH.randomValue(10, 120));
		Stepper.stopListenStep(Stepper.curStep, this, this.updateDirection);
		Stepper.listenStep(Stepper.curStep + nextUpdateDirectionStepDelay, this, this.updateDirection);
	}

	suspend() {
		this.hitable.disable();
		CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
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
		this.updateDirection();
		// this.entitieToReach.hit(this);
	}

	takeDamage(vector, damageCount) {
		this.hitable.hit(damageCount);
		this.entity.setState('SLIDE', vector);
	}

	dispose() {
		CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
		this.zombieMove.evt.removeEventListener('REACH', this, this.onReachDestination);
		this.playerFinder.evt.removeEventListener('LOST', this, this.onLostPlayer);
		this.hitable.dispose();
		super.dispose();
	}
}

export {StateFollow as default};