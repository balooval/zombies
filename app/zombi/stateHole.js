import {State} from '../states.js';
import {ANIMATION_END_EVENT} from './../textureAnimation.js';


class StateHole extends State {
	constructor(position) {
		super(position);
		this.setSprite(12, 12, 'hole');
        this.sprite.textureAnimation.evt.addEventListener(ANIMATION_END_EVENT, this, this.onAnimationEnd);
	}

    onAnimationEnd() {
        this.sprite.textureAnimation.evt.removeEventListener(ANIMATION_END_EVENT, this, this.onAnimationEnd);
        this.entity.setState('WALK');
    }

	suspend() {
		this.sprite.textureAnimation.evt.removeEventListener(ANIMATION_END_EVENT, this, this.onAnimationEnd);
		super.suspend();
	}
    
	dispose() {
        this.sprite.textureAnimation.evt.removeEventListener(ANIMATION_END_EVENT, this, this.onAnimationEnd);
		super.dispose();
	}
}

export {StateHole as default};