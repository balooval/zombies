import * as SpriteFactory from '../spriteFactory.js';

import { CompositeSprite } from '../sprite.js';
import Hitable from './hitable.js'
import {Hitbox} from '../collisionHitbox.js';
import {StateSlide as Slide} from '../states.js';

class StateSlide extends Slide {
	constructor(position, map) {
		super(position, map);
		this.id = 'SLIDE';
		this.hitable = new Hitable(map);
		this.setSprite(12, 12, 'zombiVioletHit');
		this.setHitBox(new Hitbox(-3, 3, -3, 3, true));

		// const compositeSprite = new CompositeSprite();
		// const tronc = SpriteFactory.createAnimatedSprite(8, 8, 'zombiHitTronc');
		// const cou = SpriteFactory.createAnimatedSprite(8, 8, 'zombiHitCou');
		// const brain = SpriteFactory.createAnimatedSprite(8, 8, 'zombiHitBrain');
		// const crane = SpriteFactory.createAnimatedSprite(8, 8, 'zombiHitCrane');
		// compositeSprite.addSprite('base', tronc);
		// compositeSprite.addSprite('cou', cou);
		// compositeSprite.addSprite('life2', brain);
		// compositeSprite.addSprite('life3', crane);
		// compositeSprite.hide();
		// compositeSprite.setPosition(position);
		// this.sprite = compositeSprite;
	}

	removeSpriteLayer(name) {
		this.sprite.removeSprite(name);
	}

	setEntity(entity) {
		super.setEntity(entity);
		this.hitable.setEntity(this.entity);
	}

	start(vector) {
		const params = {
			velocityX: vector.x,
			velocityY: vector.y,
			friction: 0.80,
		}
		super.start(params);
		this.hitable.enable();
	}

	onStop() {
		super.onStop();
		this.entity.setState('WALK');
	}

	suspend() {
		this.hitable.disable();
		super.suspend();
	}

	takeDamage(vector, damageCount, remainingLife) {
		this.hitable.hit(damageCount, this.position, vector, remainingLife);
		this.slide({
			velocityX: vector.x,
			velocityY: vector.y,
			friction: 0.80,
		});
	}

	dispose() {
		this.hitable.dispose();
		super.dispose();
	}
}

export {StateSlide as default};