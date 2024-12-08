import * as Input from '../input.js';
import * as InteractivePopup from '../ui/interactivePopup.js';
import * as Light from '../light.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as Stepper from '../utils/stepper.js';

import CollisionResolver from '../collisionResolver.js';
import Hitbox from '../collisionHitbox.js';

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
        this.lightAreOn = false;
        this.lightDuration = 1000;

        CollisionResolver.checkCollisionWithLayer(this, 'PLAYER');

        // const spot = new Light.SpotLight(-17, -8, Math.PI / 2, {r: 180, g: 180, b: 200});
        // spot.setRotation(Math.PI * -0.5);

        this.lights = [
            new Light.RectLight(-75, 15, 120, 30),
            new Light.BlinkRectLight(-75, 40, 120, 30),
            // spot,
        ];

        this.lights.forEach(light => light.turnOff());
        
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
        Stepper.stopListenStep(this.stepToHide, this, this.onHide);
        InteractivePopup.hide();
        Input.evt.removeEventListener('DOWN_69', this, this.onKeyDown);
    }

    onKeyDown() {
        if (this.lightAreOn === true) {
            return;
        }

        this.lights.forEach(light => light.turnOn());

        Input.evt.removeEventListener('DOWN_69', this, this.onKeyDown);
        CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
        this.lightAreOn = true;

        Stepper.listenStep(Stepper.curStep + this.lightDuration, this, this.turnOff);
    }

    turnOff() {
        console.log('turnOff');
        Stepper.stopListenStep(Stepper.curStep, this, this.turnOff);
        this.lights.forEach(light => light.turnOff());
        this.lightAreOn = false;
        CollisionResolver.checkCollisionWithLayer(this, 'PLAYER');
    }

    #onPlayerTouch(players) {
        const player = players.pop();
        this.touchedPlayer = true;

        Stepper.stopListenStep(this.stepToHide, this, this.onHide);
        this.stepToHide = Stepper.curStep + 5;
		Stepper.listenStep(this.stepToHide, this, this.onHide);
        InteractivePopup.setContent('<b>E</b> pour allumer');
        InteractivePopup.display();
        InteractivePopup.place(this.centerX, this.centerY);

        Input.evt.addEventListener('DOWN_69', this, this.onKeyDown);
    }
}

export {InteractiveBlock as default};