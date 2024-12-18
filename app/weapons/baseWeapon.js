import Interval from './../utils/interval.js';
import * as WeaponList from './../ui/weaponList.js';

class Weapon {
	constructor(shotIntervalSteps) {
		this.owner = null;
		this.isActive = false;
		this.endShotAnimatonStep = 0;
		this.ammo = 0;
		this.activesSteps = -1;
		this.icon = 'pistolIcon';
		
		this.shotFunction = this.shotWithAmmoCheck;

		this.shootInterval = new Interval(shotIntervalSteps, () => this.shotFunction(), true);
	}
	
	notUseAmmo() {
		this.shotFunction = this.launchProjectile;
	}

	canShot() {
		return this.ammo > 0;
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

	shotWithAmmoCheck() {
		this.ammo = Math.max(this.ammo - 1, 0);
		if (this.ammo === 0) {
			WeaponList.updateWeaponAmmo(this);
			return;
		}
		
		this.launchProjectile();
	}

	launchProjectile() {
		// this.ammo = Math.max(this.ammo - 1, 0);
		WeaponList.updateWeaponAmmo(this);
	}
}

export {Weapon as default};