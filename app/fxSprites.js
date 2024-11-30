import * as AnimationControl from './animationControl.js';
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

	constructor(x, y, size) {
		super(x, y, size, 'hit');
	}
}