import CollisionResolver from '../collisionResolver.js';
import Hitbox from '../collisionHitbox.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as InteractivePopup from '../ui/interactivePopup.js';
import * as Stepper from '../utils/stepper.js';
import * as Input from '../input.js';


class InteractiveBlock {
    constructor(map, posX, posY, width, height) {
        this.map = map;
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
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
            0x102030
        );

        this.touchedPlayer = false;
        this.stepToHide = 0;
        this.isActive = true;

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

    onHide() {
        console.log('onHide');
        Stepper.stopListenStep(this.stepToHide, this, this.onHide);
        InteractivePopup.hide();
        Input.evt.removeEventListener('DOWN_69', this, this.onKeyDown);
    }

    onKeyDown(toto) {
        if (this.isActive === false) {
            return;
        }
        
        console.log('onKeyDown', toto);
        const lightsData = [
            {x: -60, y: 0, size: 35},
            {x: -40, y: 0, size: 35},
            {x: -20, y: 0, size: 35},
            {x: 0, y: 0, size: 35},
            {x: 20, y: 0, size: 35},
            {x: -60, y: 30, size: 35},
            {x: -40, y: 30, size: 35},
            {x: -20, y: 30, size: 35},
            {x: 0, y: 30, size: 35},
            {x: 20, y: 30, size: 35},
        ];
        this.map.addLights(lightsData);

        Input.evt.removeEventListener('DOWN_69', this, this.onKeyDown);
        CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
        this.isActive = false;

    }

    #onPlayerTouch(players) {
        const player = players.pop();
        this.touchedPlayer = true;

        Stepper.stopListenStep(this.stepToHide, this, this.onHide);
        this.stepToHide = Stepper.curStep + 5;
		Stepper.listenStep(this.stepToHide, this, this.onHide);
        InteractivePopup.display();
        InteractivePopup.place(this.centerX, this.centerY);

        Input.evt.addEventListener('DOWN_69', this, this.onKeyDown);
    }
}

export {InteractiveBlock as default};