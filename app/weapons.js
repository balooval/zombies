import Bullet from './bullet.js';
import * as SoundLoader from './net/loaderSound.js';
import Interval from './utils/interval.js';
import * as Stepper from './utils/stepper.js';
import CollisionResolver from './collisionResolver.js';
import * as Mouse from './inputMouse.js';
import * as Particules from './particules.js';
import * as Zombi from './zombi.js';

export class ActiveWeapon {
	constructor(baseWeapon) {
		this.baseWeapon = baseWeapon;
		this.currentWeapon = this.baseWeapon;
		this.switchToBaseWeaponStep = -1;
	}
	
	changeWeapon(weapon) {
		Stepper.stopListenStep(this.switchToBaseWeaponStep, this, this.switchToBaseWeapon);
		const weaponIsActive = this.currentWeapon.isActive;
		this.currentWeapon.stopShot();
		this.currentWeapon = weapon;

		if (weaponIsActive === true) {
			this.currentWeapon.startShot();
		}
		this.switchToBaseWeaponStep = Stepper.curStep + this.currentWeapon.activesSteps;
		Stepper.listenStep(this.switchToBaseWeaponStep, this, this.switchToBaseWeapon);
	}
	
	switchToBaseWeapon(step) {
		this.changeWeapon(this.baseWeapon);
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
		this.activesSteps = -1;
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

	launchProjectile() {
		// To be overrided
	}
}

export class RayLauncher extends Weapon {
	constructor(map) {
		super(30);
		this.map = map;
	}

	launchProjectile() {
		// SoundLoader.play('eggLaunch');
		SoundLoader.playRandom(['gunA', 'gunB'], 1);

		// Zombi.createZombi(this.owner, this.map, {x: Mouse.worldPosition[0], y: Mouse.worldPosition[1]});

		const hit = this.#getZombiTouched();

		Particules.createRay(hit.start, hit.point);

		
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

		// hit.target
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
			point: {x: destX, y: destY},
		};

		const wallHit = this.map.getWallsIntersections(segment).shift();

		if (wallHit !== undefined) {
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
		return res;
	}
}

export class BasicBulletLauncher extends Weapon {
	constructor() {
		super(10);
	}

	launchProjectile() {
		SoundLoader.play('eggLaunch');
		const arrow = new Bullet(this.owner.position.x, this.owner.position.y, this.owner.viewAngle, this.owner);
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