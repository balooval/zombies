import Evt from '../utils/event.js';
import Translation from '../translation.js';
import * as MATH from '../utils/math.js';
import { getIntersection } from '../intersectionResolver.js';

class PlayerFinder {
	constructor(player, map) {
		this.player = player;
		this.map = map;
		this.evt = new Evt();
		this.entity = null;
		this.viewAngle = 1.5;
		this.viewTranslation = new Translation();
	}
	
	init(entity) {
		this.entity = entity;
	}

	update(position, translation) {
		
		const angleToPlayer = MATH.pointsAngle(
			[position.x, position.y],
			[this.player.position.x, this.player.position.y]
		);
		
		const viewAngle = Math.abs(MATH.angleDiff(angleToPlayer, translation.angle));

		if (viewAngle > this.viewAngle) {
			this.evt.fireEvent('LOST');
			return;
		}
		
		this.viewTranslation.reset(position.x, position.y);
		this.viewTranslation.updatePosition(this.player.position.x, this.player.position.y);
		const wallHit = this.map.blocks.map(block => getIntersection(this.viewTranslation, block.hitBox)).filter(res => res).pop();
		
		if (wallHit) {
			this.evt.fireEvent('LOST');
			return;
		}

		this.evt.fireEvent('VIEW');
	}
}

export {PlayerFinder as default};