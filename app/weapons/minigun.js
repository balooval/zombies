import * as MATH from '../utils/math.js';
import * as Particules from './../particules.js';
import * as Renderer from '../renderer.js';
import * as SoundLoader from './../net/loaderSound.js';

import CollisionResolver from './../collisionResolver.js';
import {HitSprite} from './../fxSprites.js';
import Weapon from './baseWeapon.js';

export class Minigun extends Weapon {
	constructor(map) {
		super(5);
		this.map = map;
		this.icon = 'pistolIcon';
		this.ammo = 100;

		this.shotAngleVariation = 0;
	}

	startShot() {
		this.shotAngleVariation = 0;
		super.startShot();
	}

	launchProjectile() {
		super.launchProjectile();

		SoundLoader.playRandom(['gunA', 'gunB'], 1);
		
		const hit = this.#getZombiTouched();
		this.shotAngleVariation = Math.min(0.15, this.shotAngleVariation + 0.01);

		Particules.createRay(hit.start, hit.point);
		
		new HitSprite(hit.point.x, hit.point.y, 6, 30);

		Renderer.setFogFlux(hit.start.x, hit.start.y, hit.point.x, hit.point.y, 5, 1);

		if (hit.target === null) {
			Particules.create(Particules.EGG_EXPLOSION, hit.point, {x: 1, y: 0.7});
			return;
		}

		const vectorPower = 3;
		const vector = {
			x: Math.cos(this.owner.viewAngle) * vectorPower,
			y: Math.sin(this.owner.viewAngle) * vectorPower,
		}
		hit.target.takeDamage(vector, 1);
	}

	#getZombiTouched() {
		const distance = 200;
        const shotAngle = MATH.randomize(this.owner.viewAngle, this.shotAngleVariation);
		const destX = this.owner.position.x + Math.cos(shotAngle) * distance;
		const destY = this.owner.position.y + Math.sin(shotAngle) * distance;

		const segment = {
			startX: this.owner.position.x,
			startY: this.owner.position.y,
			destX: destX,
			destY: destY,
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

export {Minigun as default};