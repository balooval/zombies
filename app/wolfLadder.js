import * as AnimationControl from './animationControl.js';
import {
	TweenValue,
	TWEEN_END_EVENT,
} from './utils/tween.js';
import CollisionResolver from './collisionResolver.js';
import Hitbox from './collisionHitbox.js';
import {
	wolfLadderSlot
} from './map/map.js';
import {
	ANIMATION_END_EVENT,
} from './textureAnimation.js';
import * as SoundLoader from './net/loaderSound.js';
import * as Stepper from './utils/stepper.js';
import * as SpriteFactory from './spriteFactory.js';


class WolfLadder {

	constructor(position) {
		this.position = position;
		this.animationY = new TweenValue(this.position.y);
		
		this.sprite = SpriteFactory.createAnimatedSprite(10, 10, 'wolfClimb');
		this.sprite.setPosition(this.position.x, this.position.y);

        const climbPosition = wolfLadderSlot.next().value;
        const climbDuration = (climbPosition - this.position.y) * 200;
        this.animationY.value = this.position.y;
        this.animationY.setTargetValue(climbPosition, climbDuration);
        this.animationY.evt.addEventListener(TWEEN_END_EVENT, this, this.onClimbEnd);
        this.moveFunction = this.doActionClimb;

		this.hitBox = new Hitbox(-6, -2, 1, 4, true);
		this.biteStep = 0;

		AnimationControl.registerToUpdate(this);
	}

	update(step, time) {
		this.moveFunction(time);
	}

	doActionClimb(time) {
		this.position.y = this.animationY.getValueAtTime(time);
		this.sprite.setPosition(this.position.x, this.position.y);
	}

    onClimbEnd() {
        AnimationControl.unregisterToUpdate(this);
        this.moveFunction = this.doActionWait;
		this.sprite.dispose();
		this.sprite = SpriteFactory.createAnimatedSprite(15, 15, 'wolfBiteIdle');
		this.sprite.setPosition(this.position.x, this.position.y);

		this.biteStep = Stepper.curStep + 50 + (Math.random() * 230);
		Stepper.listenStep(this.biteStep, this, this.launchBiteAnimation);
    }

    doActionWait(time) {
		
	}

	launchBiteAnimation() {
		Stepper.stopListenStep(this.biteStep, this, this.launchBiteAnimation);
		this.sprite.textureAnimation.evt.addEventListener('FRAME_2', this, this.onBite);
		this.sprite.textureAnimation.evt.addEventListener(ANIMATION_END_EVENT, this, this.onBiteEnd);
		this.sprite.changeAnimation('wolfBite');
	}
	
	onBite() {
		this.sprite.textureAnimation.evt.removeEventListener('FRAME_2', this, this.onBite);
		SoundLoader.playRandom(['wolfBiteA', 'wolfBiteB']);
		
		const collisions = CollisionResolver.entitieCollideWithLayer(this, 'PLAYER');

		collisions.forEach(player => player.hit());
	}

	onBiteEnd() {
		this.sprite.textureAnimation.evt.removeEventListener(ANIMATION_END_EVENT, this, this.onBiteEnd);
		this.sprite.changeAnimation('wolfBiteIdle');
		this.biteStep = Stepper.curStep + 50 + (Math.random() * 230);
		Stepper.listenStep(this.biteStep, this, this.launchBiteAnimation);
	}

	getWorldCollisionBox() {
		return this.hitBox.addPosition(this.position.x, this.position.y);
	}

	dispose() {
		AnimationControl.unregisterToUpdate(this);
		this.sprite.dispose();
	}
}

export {WolfLadder as default};