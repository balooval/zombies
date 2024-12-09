import * as MATH from '../utils/math.js';

import {ANIMATION_END_EVENT} from './../textureAnimation.js';
import CollisionResolver from './../collisionResolver.js';
import Hitable from './hitable.js'
import Hitbox from '../collisionHitbox.js';
import {State} from '../states.js';

class StateAttack extends State {
	constructor(position, map) {
		super(position);

		this.setHitBox(new Hitbox(-3, 3, -3, 3, true));
		// this.setSprite(8, 8, 'zombiAtack');
		this.setSprite(10, 10, 'zombiVioletAtack');
		this.hitable = new Hitable(map);

	}
    
	setEntity(entity) {
        super.setEntity(entity);
		this.hitable.setEntity(this.entity);
	}
	
	start(entitieToReach) {
        super.start();

        entitieToReach
        const angle = MATH.pointsAngle([this.position.x, this.position.y], [entitieToReach.position.x, entitieToReach.position.y]);
        this.sprite.setRotation(angle);

		this.hitable.enable();
        this.sprite.textureAnimation.setAnimation('zombiVioletAtack');
        this.sprite.textureAnimation.evt.addEventListener(ANIMATION_END_EVENT, this, this.onAnimationEnd);
        this.sprite.textureAnimation.evt.addEventListener(`FRAME_${2}`, this, this.onAnimationStartHit);
        this.sprite.textureAnimation.evt.addEventListener(`FRAME_${3}`, this, this.onAnimationStopHit);
	}
    
    suspend() {
        this.hitable.disable();
		CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
        this.sprite.textureAnimation.evt.removeEventListener(ANIMATION_END_EVENT, this, this.onAnimationEnd);
        this.sprite.textureAnimation.evt.removeEventListener(`FRAME_${2}`, this, this.onAnimationStartHit);
        this.sprite.textureAnimation.evt.removeEventListener(`FRAME_${3}`, this, this.onAnimationStopHit);
		super.suspend();
	}

    onAnimationStartHit() {
        CollisionResolver.checkCollisionWithLayer(this, 'PLAYER');
    }
    
    onAnimationStopHit() {
        CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
    }
    
    onAnimationEnd() {
        this.entity.setState('WALK');
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
    }

	takeDamage(vector, damageCount) {
		this.hitable.hit(damageCount, this.position);
		this.entity.setState('SLIDE', vector);
	}

	dispose() {
        this.hitable.disable();
		this.hitable.dispose();
		CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
        this.sprite.textureAnimation.evt.removeEventListener(ANIMATION_END_EVENT, this, this.onAnimationEnd);
        this.sprite.textureAnimation.evt.removeEventListener(`FRAME_${2}`, this, this.onAnimationStartHit);
        this.sprite.textureAnimation.evt.removeEventListener(`FRAME_${3}`, this, this.onAnimationStopHit);
		super.dispose();
	}
}

export {StateAttack as default};