import Bomb from './grenade.js';
import CollisionResolver from './../collisionResolver.js';
import * as SoundLoader from './../net/loaderSound.js';
import * as SpriteFactory from './../spriteFactory.js';
import {ANIMATION_END_EVENT} from './../textureAnimation.js';
import * as Particules from './../particules.js';
import Hitbox from './../collisionHitbox.js';
import Weapon from './baseWeapon.js';

export class Batte extends Weapon {
	constructor() {
		super(25);
		this.icon = 'bullet';
		this.ammo = -1;
        this.hitBox = new Hitbox(-4, 4, -4, 4, true);
        this.sprite = SpriteFactory.createAnimatedSprite(10, 10, 'batteIdle');
        this.sprite.textureAnimation.evt.addEventListener(ANIMATION_END_EVENT, this, this.onAnimationEnd);
        this.sprite.textureAnimation.evt.addEventListener(`FRAME_${3}`, this, this.onAnimationHit);
        this.sprite.textureAnimation.evt.addEventListener(`FRAME_${4}`, this, this.onAnimationStopHit);
        this.position = {x: 0, y: 0};
        this.vector = {x: 0, y: 0};
	}

    enable() {
        this.update();
        this.sprite.display();
	}

	disable() {
		this.sprite.hide();
	}
    
    update() {
        this.vector.x = Math.cos(this.owner.viewAngle + 0.9) * 3;
        this.vector.y = Math.sin(this.owner.viewAngle + 0.9) * 3;
        const vectX = Math.cos(this.owner.viewAngle);
        const vectY = Math.sin(this.owner.viewAngle);
        this.position.x = this.owner.position.x + vectX * 5;
        this.position.y = this.owner.position.y + vectY * 5;
        this.sprite.setPosition(this.position.x, this.position.y);
        this.sprite.setRotation(this.owner.viewAngle);
	}

    onCollide(collisions, layersName) {
        for (const zombi of collisions) {
			zombi.takeDamage(this.vector, 1);
			Particules.create(Particules.ENNEMI_HIT, this.position, this.vector);
			SoundLoader.play('eggCrack', 0.2);
		}
    }

    getWorldCollisionBox() {
        // const offsetX = Math.cos(this.owner.viewAngle) * 5;
        // const offsetY = Math.sin(this.owner.viewAngle) * 5;
        // this.position.x = this.owner.position.x + offsetX;
        // this.position.y = this.owner.position.y + offsetY;

		return this.hitBox.addPosition(this.position.x, this.position.y);
	}
    
	launchProjectile() {
		// SoundLoader.play('eggLaunch');
        this.sprite.changeAnimation('batteHit');
		super.launchProjectile();
	}
    
    onAnimationHit() {
        CollisionResolver.checkCollisionWithLayer(this, 'ENNEMIES');
    }

    onAnimationStopHit() {
        CollisionResolver.forgotCollisionWithLayer(this, 'ENNEMIES');
    }

    onAnimationEnd() {
        this.sprite.changeAnimation('batteIdle');
    }
    
}

export {Batte as default};