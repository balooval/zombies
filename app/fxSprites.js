import * as AnimationControl from './animationControl.js';
import * as Light from './light.js';
import * as SpriteFactory from './spriteFactory.js';

import {
	ANIMATION_END_EVENT,
} from './textureAnimation.js';

class FxSprite {

	constructor(x, y, size, animation) {
		this.sprite = SpriteFactory.createAnimatedSprite(size, size, animation);
		this.sprite.setPosition(x, y);
		this.sprite.textureAnimation.evt.addEventListener(ANIMATION_END_EVENT, this, this.dispose);
	}

	dispose() {
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
			this.light = new Light.PointLight(lightSize, x, y);
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