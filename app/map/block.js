import * as Debug from '../debugCanvas.js';
import * as Renderer from '../renderer.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as TextureLoader from '../net/loaderTexture.js';

import {FakeHitbox, Hitbox} from '../collisionHitbox.js';

import BlockBase from './blockBase.js';
import CollisionResolver from '../collisionResolver.js';

export class BlockWall extends BlockBase {
    constructor(posX, posY, width, height) {
        super(posX, posY, width, height);
        
        this.hitBox = new Hitbox(this.posX, this.posX + this.width, this.posY - this.height, this.posY, true);
        this.hitBoxLight = new Hitbox(this.posX + 1, this.posX + this.width - 1, this.posY - this.height + 1, this.posY - 1, true, 1);

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

    getLightCollisionBox() {
		return this.hitBoxLight;
	}

    dispose() {
        super.dispose();
        // TODO: retirer le Renderer.setFogBlock
        CollisionResolver.removeFromLayer(this, 'WALLS');
        this.sprite.dispose();
    }
}

export class BlockObstacle extends BlockBase {
    constructor(texture, posX, posY, width, height) {
        super(posX, posY, width, height);
        
        this.hitBox = new Hitbox(this.posX, this.posX + this.width, this.posY - this.height, this.posY, true);
        // this.hitBoxLight = new FakeHitbox(this.posX + 1, this.posX + this.width - 1, this.posY - this.height + 1, this.posY - 1, true, 1);
        this.hitBoxLight = new Hitbox(this.posX, this.posX + this.width, this.posY - this.height, this.posY, true, -1);

        this.sprite = SpriteFactory.createStillSprite(
            this.posX + this.width / 2,
            this.posY - this.height / 2,
            this.width,
            this.height,
            TextureLoader.get(texture)
        );

        CollisionResolver.addToLayer(this, 'WALLS');

        Renderer.setFogBlock(this.posX, this.posY, this.width, this.height);
    }

    getWorldCollisionBox() {
		return this.hitBox;
	}

    getLightCollisionBox() {
		return this.hitBoxLight;
	}

    dispose() {
        super.dispose();
        // TODO: retirer le Renderer.setFogBlock
        CollisionResolver.removeFromLayer(this, 'WALLS');
        this.sprite.dispose();
    }
}