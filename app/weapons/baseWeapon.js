import Interval from './../utils/interval.js';
import * as WeaponList from './../ui/weaponList.js';

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

	update() {
		
	}

	enable() {

	}

	disable() {
		
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
		this.ammo = Math.max(this.ammo - 1, 0);
		WeaponList.updateWeaponAmmo(this);
	}
}

export {Weapon as default};