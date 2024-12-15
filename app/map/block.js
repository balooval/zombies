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

        CollisionResolver.addToLayer(this, 'WALLS');

        Renderer.setFogBlock(this.posX, this.posY, this.width, this.height);
    }

    getWorldCollisionBox() {
		return this.hitBox;
	}

    dispose() {
        // TODO: retirer le Renderer.setFogBlock
        CollisionResolver.removeFromLayer(this, 'WALLS');
        this.hitBox.dispose();
        this.sprite.dispose();
    }
}

export {Block as default};