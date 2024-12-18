import * as MATH from '../utils/math.js';
import * as Renderer from '../renderer.js';

import Evt from '../utils/event.js';
import Translation from '../translation.js';

class Move {
	constructor(moveSpeed, position, map) {
		this.speedBase = moveSpeed;
		this.moveSpeed = moveSpeed;
		this.map = map;
		this.speedStep = 0;
		this.position = position;
		this.moveTranslation = new Translation();
		this.destX = 0;
		this.destY = 0;
		this.evt = new Evt();
	}

	setDestination(x, y) {
		this.destX = x;
		this.destY = y;
		this.moveTranslation.angle = MATH.pointsAngle([this.position.x, this.position.y], [this.destX, this.destY]);
	}

	update() {
		this.speedStep += 0.1;
		this.moveSpeed = (this.speedBase * 0.5) + ((Math.sin(this.speedStep) + 1) * 0.5) * this.speedBase;

		const translationX = Math.cos(this.moveTranslation.angle);
		const translationY = Math.sin(this.moveTranslation.angle);

		const newX = this.position.x + translationX * this.moveSpeed;
		const newY = this.position.y + translationY * this.moveSpeed;
		
		this.moveTranslation.update(this.position.x, this.position.y, newX, newY);

		const wallHit = this.map.getWallsIntersections(this.moveTranslation).shift();

		if (wallHit) {
			console.log('MUR DEVANT MOI');
			this.evt.fireEvent('BLOCKED');
			return;
		}

		this.map.checkBlood(this.moveTranslation);

		this.position.x = newX;
		this.position.y = newY;

		Renderer.setFogFlux(this.moveTranslation.startX, this.moveTranslation.startY, this.moveTranslation.destX, this.moveTranslation.destY, 15, 0.5);

		const distanceFromTargetX = this.destX - this.position.x;
		const distanceFromTargetY = this.destY - this.position.y;
		const distanceFromTargetTotal = Math.abs(distanceFromTargetX) + Math.abs(distanceFromTargetY);

		if (distanceFromTargetTotal < 1) {
			this.evt.fireEvent('REACH');
		}
	}
}

export {Move as default};