import * as SoundLoader from '../net/loaderSound.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as TextureLoader from '../net/loaderTexture.js';

import BlockBase from './blockBase.js';
import CollisionResolver from '../collisionResolver.js';
import {Hitbox} from '../collisionHitbox.js';
import {createRandomBonus} from '../bonus.js';

class WoodenBox extends BlockBase {
    constructor(map, posX, posY, width, height, onBreak) {
        super(posX, posY, width, height);

        this.map = map;
        this.onBreak = onBreak;
        this.life = 4;

        this.hitBox = new Hitbox(this.posX, this.posX + this.width, this.posY - this.height, this.posY, true, 1);
        this.hitBoxLight = new Hitbox(this.posX, this.posX + this.width, this.posY - this.height, this.posY, true, -1);

        this.centerX = this.posX + this.width / 2;
        this.centerY = this.posY - this.height / 2;

        this.sprite = SpriteFactory.createStillSprite(
            this.centerX,
            this.centerY,
            this.width,
            this.height,
            TextureLoader.get('woodenBox')
        );

        CollisionResolver.addToLayer(this, 'WALLS');
    }

    takeDamage(vector, damageCount) {
        this.life -= damageCount;
        
        if (this.life <= 0) {
            this.#break();
        }
    }

    #break() {
        SoundLoader.play('woodenBoxBreak');
        this.map.removeBlock(this);
        this.dispose();
        createRandomBonus(this.onBreak.bonus, {x: this.centerX, y: this.centerY}, this.map);
        this.onBreak.zombies.forEach(firstState => this.map.createZombie(this.centerX, this.centerY, firstState));
    }

    getWorldCollisionBox() {
		return this.hitBox;
	}

    getLightCollisionBox() {
		return this.hitBoxLight ;
	}

    dispose() {
        super.dispose();
        CollisionResolver.removeFromLayer(this, 'WALLS');
        this.hitBoxLight.dispose();
        this.sprite.dispose();
    }
}

export {WoodenBox as default};