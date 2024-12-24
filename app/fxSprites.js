import * as AnimationControl from './animationControl.js';
import * as Light from './light.js';
import * as MATH from './utils/math.js';
import * as SpriteFactory from './spriteFactory.js';

import {
	ANIMATION_END_EVENT,
} from './textureAnimation.js';
import {DISPOSE_EVENT} from './map/map.js';
import {getCurrentMap} from './gameLevel.js';

class FxSprite {

	constructor(x, y, size, animation) {
		this.map = getCurrentMap();
		this.sprite = SpriteFactory.createAnimatedSprite(size, size, animation);
		this.sprite.setPosition(x, y);
		this.sprite.textureAnimation.evt.addEventListener(ANIMATION_END_EVENT, this, this.dispose);
		this.map.evt.addEventListener(DISPOSE_EVENT, this, this.dispose);
	}

	dispose() {
		this.map.evt.removeEventListener(DISPOSE_EVENT, this, this.dispose);
		AnimationControl.unregisterToUpdate(this);
		this.sprite.textureAnimation.evt.removeEventListener(ANIMATION_END_EVENT, this, this.dispose);
		this.sprite.dispose();
	}
}

export class HitSprite extends FxSprite {

	constructor(x, y, size, lightSize) {
		super(x, y, size, 'hit');
		this.light = null;

		if (lightSize > 0) {
			this.light = new Light.PointLight(lightSize, x, y, '#FFFFFF');
			this.light.turnOn();
		}
	}

	dispose() {
		if (this.light !== null) {
			this.light.dispose();
		}
		super.dispose();
	}
}

export class DeadZombieSprite {

	constructor(map, x, y, angle, animation) {
		this.map = getCurrentMap();
		this.sprite = SpriteFactory.createAnimatedSprite(17, 17, animation);
		this.sprite.setPosition(x, y);
		this.sprite.setDepth(10);
		this.sprite.setRotation(angle);
		this.map.evt.addEventListener(DISPOSE_EVENT, this, this.dispose);
	}

	dispose() {
		this.sprite.dispose();
		this.map.evt.removeEventListener(DISPOSE_EVENT, this, this.dispose);
	}
}