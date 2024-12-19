import * as Input from '../input.js';
import * as InteractivePopup from '../ui/interactivePopup.js';
import * as Light from '../light.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as Stepper from '../utils/stepper.js';

import {FakeHitbox, Hitbox} from '../collisionHitbox.js';

import BlockBase from './blockBase.js';
import CollisionResolver from '../collisionResolver.js';
import {getCurrentLevel} from '../gameLevel.js';

class Exit extends BlockBase {
    constructor(map, posX, posY, width, height, nextMap, nextExit) {
        super(posX, posY, width, height);

        this.map = map;
        this.nextMap = nextMap;
        this.nextExit = nextExit;
        this.centerX = this.posX + (this.width * 0.5);
        this.centerY = this.posY - (this.height * 0.5);

        this.hitBox = new FakeHitbox();
        
        const margin = 2;
        this.interactiveHitBox = new Hitbox(this.posX - margin, this.posX + this.width + margin, this.posY - this.height - margin, this.posY + margin, true);
        this.sprite = SpriteFactory.createFlatRectangleSprite(
            this.posX + this.width / 2,
            this.posY - this.height / 2,
            this.width,
            this.height,
            0x102030
        );

        CollisionResolver.checkCollisionWithLayer(this, 'PLAYER');
    }

    getWorldCollisionBox() {
		return this.interactiveHitBox;
	}

    onCollide(collisions, layersName) {
		switch (layersName) {
			case 'PLAYER':
				this.#onPlayerTouch(collisions);
			break;
		}
	}

    #onPlayerTouch(players) {
        const player = players.pop();
        const gameLevel = getCurrentLevel();
        gameLevel.goToMap(this.nextMap, this.nextExit);
    }

    dispose() {
        super.dispose();
        CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
        this.sprite.dispose();
    }
}

export {Exit as default};