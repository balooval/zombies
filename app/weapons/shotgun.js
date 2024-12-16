import * as MATH from '../utils/math.js';
import * as Particules from './../particules.js';
import * as Renderer from '../renderer.js';
import * as SoundLoader from './../net/loaderSound.js';

import CollisionResolver from './../collisionResolver.js';
import {HitSprite} from './../fxSprites.js';
import Weapon from './baseWeapon.js';

export class Shotgun extends Weapon {
	constructor(map) {
		super(50);
		this.map = map;
		this.icon = 'shotgunIcon';
		this.ammo = 50;
		this.rayCount = 6;
		this.shotAngle = 0.3;
		this.shotAngleStep = this.shotAngle / this.rayCount;
	}

	launchProjectile() {
		super.launchProjectile();

		SoundLoader.playRandom(['gunA', 'gunB'], 1);

		for (let i = 0; i < this.rayCount; i ++) {
			const currentAngle = this.owner.viewAngle - (this.shotAngleStep * 0.5) + this.shotAngleStep * i;
			this.#shotRay(currentAngle);
		}
	}

	#shotRay(currentAngle) {
		const hit = this.#getZombiTouched(currentAngle);
		this.shotAngleVariation = Math.min(0.15, this.shotAngleVariation + 0.01);

		Particules.createRay(hit.start, hit.point);
		
		Renderer.setFogFlux(hit.start.x, hit.start.y, hit.point.x, hit.point.y, 5, 1);

		const vectorPower = 3;
		const vector = {
			x: Math.cos(this.owner.viewAngle) * vectorPower,
			y: Math.sin(this.owner.viewAngle) * vectorPower,
		}

		if (hit.target === null) {
			if (hit.point.block) {
				Particules.create(Particules.EGG_EXPLOSION, hit.point, {x: 1, y: 0.7});
				hit.point.block.takeDamage(vector, 2);
			}
			return;
		}

		const distance = MATH.distance(hit.start, hit.point);
		
		const damage = Math.max(5 - (distance / 20), 1);
		
		hit.target.takeDamage(vector, damage);
	}

	#getZombiTouched(shotAngle) {
		const distance = 200;
		const destX = this.owner.position.x + Math.cos(shotAngle) * distance;
		const destY = this.owner.position.y + Math.sin(shotAngle) * distance;

		const segment = {
			startX: this.owner.position.x,
			startY: this.owner.position.y,
			destX: destX,
			destY: destY,
			angle: shotAngle,
		};

		const res = {
			start: this.owner.position,
			target: null,
			wall: false,
			point: {x: destX, y: destY},
		};

		const wallHit = this.map.getWallsIntersections(segment).shift();

		if (wallHit !== undefined) {
			res.wall = true;
			res.point = wallHit;
		}

		const touched = CollisionResolver.checkIntersectionWithLayer(segment, 'ENNEMIES');

		const zombiHit = touched.shift();

		if (zombiHit === undefined) {
			return res;
		}

		if (wallHit === undefined) {
			res.target = zombiHit.target;
			res.point = zombiHit.point;
			return res;
		}
		
		if (wallHit.distance < zombiHit.distance) {
			return res;
		}
		
		res.target = zombiHit.target;
		res.point = zombiHit.point;
		res.wall = false;
		return res;
	}
}

export {Shotgun as default};