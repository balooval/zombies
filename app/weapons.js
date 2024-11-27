import Bullet from './bullet.js';
import * as SoundLoader from './net/loaderSound.js';
import Interval from './utils/interval.js';
import * as Stepper from './utils/stepper.js';
import CollisionResolver from './collisionResolver.js';
import * as Particules from './particules.js';
import * as WeaponList from './ui/weaponList.js';
import {HitSprite} from './fxSprites.js';

export class ActiveWeapon {
	constructor() {
		this.currentWeapon = null;
	}
	
	changeWeapon(weapon) {
		let weaponIsActive = false;

		if (this.currentWeapon) {
			weaponIsActive = this.currentWeapon.isActive;
			this.currentWeapon.stopShot();
		}
		this.currentWeapon = weapon;

		if (weaponIsActive === true) {
			this.currentWeapon.startShot();
		}
	}
	
	startShot() {
		this.currentWeapon.startShot();
	}

	stopShot() {
		this.currentWeapon.stopShot();
	}
}

class Weapon {
	constructor(shotIntervalSteps) {
		this.owner = null;
		this.isActive = false;
		this.endShotAnimatonStep = 0;
		this.ammo = -1;
		this.activesSteps = -1;
		this.icon = 'pistolIcon';
		this.shootInterval = new Interval(shotIntervalSteps, () => this.launchProjectile(), true);
	}

	setOwner(owner) {
		this.owner = owner;
	}

	startShot() {
		this.isActive = true;
		this.shootInterval.start();
	}

	stopShot() {
		this.isActive = false;
		this.shootInterval.stop();
	}

	addAmmo(count) {
		this.ammo += count;
		WeaponList.updateWeaponAmmo(this);
	}

	launchProjectile() {
		WeaponList.updateWeaponAmmo(this);
	}
}

export class RayLauncher extends Weapon {
	constructor(map) {
		super(30);
		this.map = map;
		this.icon = 'pistolIcon';
		this.ammo = 5;
	}

	launchProjectile() {
		
		if (this.ammo === 0) {
			return;
		}

		this.ammo = Math.max(this.ammo - 1, 0);
		super.launchProjectile();

		SoundLoader.playRandom(['gunA', 'gunB'], 1);

		const hit = this.#getZombiTouched();

		Particules.createRay(hit.start, hit.point);

		
		const hitSprite = new HitSprite(hit.point.x, hit.point.y, 6);

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

export class BasicBulletLauncher extends Weapon {
	constructor() {
		super(10);
		this.icon = 'bullet';
	}

	launchProjectile() {
		SoundLoader.play('eggLaunch');
		const arrow = new Bullet(this.owner.position.x, this.owner.position.y, this.owner.viewAngle, this.owner);
		super.launchProjectile();
	}
}

export class DoubleEggLauncher extends BasicBulletLauncher {
	constructor() {
		super();
		this.activesSteps = 600;
		this.stepBeforeSecondLaunch = 6;
	}
	
	launchProjectile() {
		super.launchProjectile();
		Stepper.listenStep(Stepper.curStep + this.stepBeforeSecondLaunch, this, this.launchSecondEgg);
	}
	
	launchSecondEgg(step) {
		Stepper.stopListenStep(step, this, this.launchSecondEgg);
		super.launchProjectile();
	}
}