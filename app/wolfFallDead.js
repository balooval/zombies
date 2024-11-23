import * as AnimationControl from './animationControl.js';
import Hitbox from './collisionHitbox.js';
import CollisionResolver from './collisionResolver.js';
import * as SoundLoader from './net/loaderSound.js';
import * as Stepper from './utils/stepper.js';
import {DustSprite} from './fxSprites.js';
import * as SpriteFactory from './spriteFactory.js';
import * as Particules from './particules.js';
import {
	TweenValue,
	TWEEN_END_EVENT,
} from './utils/tween.js';

class DeadWolfSprite {

	constructor(position) {
		this.position = position;
		this.gravity = 0.04;
		this.velY = 0;

		this.tweenOpacity = new TweenValue(1);
        this.updateFunction = this.updateFall;
        this.disposeStep = 0;
		
		this.sprite = SpriteFactory.createAnimatedSprite(8, 8, 'wolfDeath');
		this.sprite.setPosition(this.position.x, this.position.y);
		AnimationControl.registerToUpdate(this);
		this.hitBox = new Hitbox(-2, 2, -2, 3, true);

        CollisionResolver.checkCollisionWithLayer(this, 'MAP');

		this.particules = new Particules.WolfFallingParticules(this);
	}

	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x, this.position.y);
	}
	
	update(step, time) {
        this.updateFunction(time);
    }

	updateFall() {
		this.velY -= this.gravity;
		this.position.y += this.velY;
		this.sprite.setPosition(this.position.x, this.position.y);
	}

    doNothing() {

    }

	changeOpacity(time) {
		const opacity = this.tweenOpacity.getValueAtTime(time);
		this.sprite.setOpacity(opacity);
	}

	onCollide(collisions) {
		CollisionResolver.forgotCollisionWithLayer(this, 'MAP');
        this.sprite.changeAnimation('wolfDeadGround');
        // this.disposeStep = Stepper.curStep + 120;
        // Stepper.listenStep(this.disposeStep, this, this.dispose);
		
		SoundLoader.playRandom(['wolfHitGroundA', 'wolfHitGroundB', 'wolfHitGroundC']);
		
		const dust = new DustSprite(this.position.x, this.position.y, 10);
		this.particules.dispose();
		
		// this.tweenOpacity.value = 1;
		this.tweenOpacity.setTargetValue(0, 2000);
		this.tweenOpacity.evt.addEventListener(TWEEN_END_EVENT, this, this.dispose);
        this.updateFunction = this.changeOpacity;
	}

	dispose() {
		this.tweenOpacity.evt.removeEventListener(TWEEN_END_EVENT, this, this.dispose);
		AnimationControl.unregisterToUpdate(this);
        Stepper.listenStep(this.disposeStep, this, this.dispose);
		this.sprite.dispose();
		this.hitBox.dispose();
		this.particules.dispose();
	}
}

export {DeadWolfSprite as default};