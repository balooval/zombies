import * as Input from '../input.js';
import * as InteractivePopup from '../ui/interactivePopup.js';
import * as Light from '../light.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as Stepper from '../utils/stepper.js';

import {FakeHitbox, Hitbox} from '../collisionHitbox.js';

import BlockBase from './blockBase.js';
import CollisionResolver from '../collisionResolver.js';

class Door extends BlockBase {
    constructor(map, posX, posY, width, height, openState) {
        super(posX, posY, width, height);
        
        this.map = map;
        this.openState = openState;
        this.label = "E pour ouvrir";
        this.centerX = this.posX + (this.width * 0.5);
        this.centerY = this.posY - (this.height * 0.5);

        this.hitBox = new Hitbox(this.posX, this.posX + this.width, this.posY - this.height, this.posY, true);
        
        const margin = 2;
        this.interactiveHitBox = new Hitbox(this.posX - margin, this.posX + this.width + margin, this.posY - this.height - margin, this.posY + margin, true);
        this.sprite = SpriteFactory.createFlatRectangleSprite(
            this.posX + this.width / 2,
            this.posY - this.height / 2,
            this.width,
            this.height,
            0xff0000
        );

        this.touchedPlayer = false;
        this.stepToHide = 0;
        this.isOpen = false;

        CollisionResolver.addToLayer(this, 'WALLS');

        CollisionResolver.checkCollisionWithLayer(this, 'PLAYER');
    }

    getWorldCollisionBox() {
		return this.hitBox;
	}

    getLightCollisionBox() {
		return this.hitBox;
	}

    onCollide(collisions, layersName) {
		switch (layersName) {
			case 'PLAYER':
				this.#onPlayerTouch(collisions);
			break;
		}
	}

    onHide() {
        Stepper.stopListenStep(this.stepToHide, this, this.onHide);
        InteractivePopup.hide();
        Input.evt.removeEventListener('DOWN_69', this, this.onKeyDown);
        this.touchedPlayer = false;
    }

    onKeyDown() {
        
        // CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
        // Input.evt.removeEventListener('DOWN_69', this, this.onKeyDown);
        
        if (this.isOpen === true) {
            this.#close();
        } else {
            this.#open();
        }

        this.map.onWallsChanged();
    }

    #open() {
        this.isOpen = true;
        this.label = "E pour fermer";
        
        this.hitBox.dispose();
        this.hitBox = new Hitbox(this.openState.x, this.openState.x + this.openState.width, this.openState.y - this.openState.height, this.openState.y, true);
        
        this.sprite.dispose();
        this.sprite = SpriteFactory.createFlatRectangleSprite(
            this.openState.x + this.openState.width / 2,
            this.openState.y - this.openState.height / 2,
            this.openState.width,
            this.openState.height,
            0x00ff00
        );
    }

    #close() {
        this.isOpen = false;
        this.label = "E pour ouvrir";
        
        this.hitBox.dispose();
        this.hitBox = new Hitbox(this.posX, this.posX + this.width, this.posY - this.height, this.posY, true);

        this.sprite.dispose();
        this.sprite = SpriteFactory.createFlatRectangleSprite(
            this.posX + this.width / 2,
            this.posY - this.height / 2,
            this.width,
            this.height,
            0xff0000
        );
    }

    #onPlayerTouch(players) {
        if (this.touchedPlayer === false) {
            Input.evt.addEventListener('DOWN_69', this, this.onKeyDown);
        }
        
        this.touchedPlayer = true;

        Stepper.stopListenStep(this.stepToHide, this, this.onHide);
        this.stepToHide = Stepper.curStep + 5;
		Stepper.listenStep(this.stepToHide, this, this.onHide);
        InteractivePopup.setContent(this.label);
        InteractivePopup.display();
        InteractivePopup.place(this.centerX, this.centerY);
    }

    dispose() {
        super.dispose();
        CollisionResolver.removeFromLayer(this, 'WALLS');
        CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
        this.sprite.dispose();
    }
}

export {Door as default};