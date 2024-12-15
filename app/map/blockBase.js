import {FakeHitbox} from '../collisionHitbox.js';

class BlockBase {
    constructor(posX, posY, width, height) {
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.isSolid = true;
        this.hitBox = new FakeHitbox();
    }

    getWorldCollisionBox() {
		return this.hitBox;
	}

    getLightCollisionBox() {
		return this.hitBox;
	}

    takeDamage(vector, damageCount) {
        
    }

    dispose() {
        this.hitBox.dispose();
    }
}

export {BlockBase as default};