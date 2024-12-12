import * as Debug from '../debugCanvas.js';
import * as Renderer from '../renderer.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as TextureLoader from '../net/loaderTexture.js';

import CollisionResolver from '../collisionResolver.js';
import {Hitbox} from '../collisionHitbox.js';

class Block {
    constructor(posX, posY, width, height) {
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.isSolid = true;
        this.hitBox = new Hitbox(this.posX, this.posX + this.width, this.posY - this.height, this.posY, true);

        this.sprite = SpriteFactory.createStillSprite(
            this.posX + this.width / 2,
            this.posY - this.height / 2,
            this.width,
            this.height,
            TextureLoader.get('wallTop')
        );

        // this.sprite = SpriteFactory.createFlatRectangleSprite(
        //     this.posX + this.width / 2,
        //     this.posY - this.height / 2,
        //     this.width,
        //     this.height,
        //     0x102030
        // );

        CollisionResolver.addToLayer(this, 'WALLS');

        // Debug.drawBlock(this);
        
        Renderer.setFogBlock(this.posX, this.posY, this.width, this.height);
    }

    getWorldCollisionBox() {
		return this.hitBox;
	}
}

export {Block as default};