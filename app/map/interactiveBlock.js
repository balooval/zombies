import CollisionResolver from '../collisionResolver.js';
import Hitbox from '../collisionHitbox.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as InteractivePopup from '../ui/interactivePopup.js';
import * as Stepper from '../utils/stepper.js';


class InteractiveBlock {
    constructor(posX, posY, width, height) {
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

        CollisionResolver.checkCollisionWithLayer(this, 'PLAYER');

        // AnimationControl.registerToUpdate(this);
    }

    // update() {

    // }

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
    }

    #onPlayerTouch(players) {
        const player = players.pop();
        this.touchedPlayer = true;

        Stepper.stopListenStep(this.stepToHide, this, this.onHide);
        this.stepToHide = Stepper.curStep + 5;
		Stepper.listenStep(this.stepToHide, this, this.onHide);
        InteractivePopup.display();
        InteractivePopup.place(this.centerX, this.centerY);
    }
}

export {InteractiveBlock as default};