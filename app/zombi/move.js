import Evt from '../utils/event.js';
import Translation from '../translation.js';
import * as MATH from '../utils/math.js';

class Move {
	constructor(moveSpeed, position) {
		this.moveSpeed = moveSpeed;
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
		const translationX = Math.cos(this.moveTranslation.angle);
		const translationY = Math.sin(this.moveTranslation.angle);

		const newX = this.position.x + translationX * this.moveSpeed;
		const newY = this.position.y + translationY * this.moveSpeed;
		
		this.moveTranslation.update(this.position.x, this.position.y, newX, newY);

		this.position.x = newX; 
		this.position.y = newY; 

		const distanceFromTargetX = this.destX - this.position.x;
		const distanceFromTargetY = this.destY - this.position.y;
		const distanceFromTargetTotal = Math.abs(distanceFromTargetX) + Math.abs(distanceFromTargetY);

		if (distanceFromTargetTotal < 1) {
			this.evt.fireEvent('REACH');
		}
	}
}

export {Move as default};