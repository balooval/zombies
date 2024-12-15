import * as Input from '../input.js';
import * as InteractivePopup from '../ui/interactivePopup.js';
import * as Light from '../light.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as Stepper from '../utils/stepper.js';

import {FakeHitbox, Hitbox} from '../collisionHitbox.js';

import CollisionResolver from '../collisionResolver.js';

class InteractiveBlock {
    constructor(map, posX, posY, width, height, label, onActive, isSolid) {
        this.map = map;
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.label = label;
        this.isSolid = isSolid;
        this.centerX = this.posX + (this.width * 0.5);
        this.centerY = this.posY - (this.height * 0.5);

        if (this.isSolid === true) {
            this.hitBox = new Hitbox(this.posX, this.posX + this.width, this.posY - this.height, this.posY, true);
        } else {
            this.hitBox = new FakeHitbox();
        }
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
        this.onDuration = onActive.duration;

        CollisionResolver.checkCollisionWithLayer(this, 'PLAYER');

        this.lights = [
            // new Light.RectLight(-75, 15, 120, 30),
            // new Light.BlinkRectLight(-75, 40, 120, 30),
        ];

        this.#buildLights(onActive);

        this.lights.forEach(light => light.turnOff());

        
    }

    #buildLights(onActive) {
        if (!onActive.lights) {
            return;
        }

        for (const light of onActive.lights) {
            if (light.type === 'rectLight') {
                this.lights.push(new Light.RectLight(light.x, light.y, light.width, light.height));
            }

            if (light.type === 'blinkRectLight') {
                this.lights.push(new Light.BlinkRectLight(light.x, light.y, light.width, light.height));
            }
            
            if (light.type === 'pointLight') {
                this.lights.push(new Light.PointLight(light.size, light.x, light.y, light.color));
            }
        }
    }

    getWorldCollisionBox() {
		return this.interactiveHitBox;
	}

    getLightCollisionBox() {
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
        this.touchedPlayer = false;
    }

    onKeyDown() {
        if (this.lightAreOn === true) {
            return;
        }
        
        CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
        Input.evt.removeEventListener('DOWN_69', this, this.onKeyDown);
        
        this.lights.forEach(light => light.turnOn());
        CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
        this.lightAreOn = true;

        if (this.onDuration > 0) {
            Stepper.listenStep(Stepper.curStep + this.onDuration, this, this.turnOff);
        }
    }

    turnOff() {
        Stepper.stopListenStep(Stepper.curStep, this, this.turnOff);
        this.lights.forEach(light => light.turnOff());
        this.lightAreOn = false;
        CollisionResolver.checkCollisionWithLayer(this, 'PLAYER');
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
        CollisionResolver.forgotCollisionWithLayer(this, 'PLAYER');
        this.hitBox.dispose();
        this.sprite.dispose();
        this.lights.forEach(light => light.dispose());
    }
}

export {InteractiveBlock as default};