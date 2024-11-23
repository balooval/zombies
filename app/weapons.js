import Bullet from './bullet.js';
import * as SoundLoader from './net/loaderSound.js';
import Interval from './utils/interval.js';
import * as Stepper from './utils/stepper.js';

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
	constructor() {
		this.owner = null;
		this.isActive = false;
		this.endShotAnimatonStep = 0;
		this.activesSteps = -1;
		const shotIntervalSteps = 10;
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

export class BasicBulletLauncher extends Weapon {
	constructor() {
		super();
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