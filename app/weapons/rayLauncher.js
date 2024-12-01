import * as SoundLoader from './../net/loaderSound.js';
import CollisionResolver from './../collisionResolver.js';
import * as Particules from './../particules.js';
import {HitSprite} from './../fxSprites.js';
import Weapon from './baseWeapon.js';

export class RayLauncher extends Weapon {
	constructor(map) {
		super(30);
		this.map = map;
		this.icon = 'pistolIcon';
		this.ammo = 10;
	}

	launchProjectile() {
		super.launchProjectile();
		
		// if (this.canShot() === false) {
		// 	return;
		// }

		SoundLoader.playRandom(['gunA', 'gunB'], 1);

		const hit = this.#getZombiTouched();

		Particules.createRay(hit.start, hit.point);

		
		new HitSprite(hit.point.x, hit.point.y, 6, 35);

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
		const destX = this.owner.position.x + Math.cos(this.owner.viewAngle) * distance;
		const destY = this.owner.position.y + Math.sin(this.owner.viewAngle) * distance;

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

export {RayLauncher as default};