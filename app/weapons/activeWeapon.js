
export class ActiveWeapon {
	constructor(owner) {
		this.owner = owner;
		this.currentWeapon = null;
	}

	update() {
		if (this.currentWeapon) {
			this.currentWeapon.update();
		}
	}
	
	changeWeapon(weapon) {
		let weaponIsActive = false;

		if (this.currentWeapon) {
			this.currentWeapon.disable();
			weaponIsActive = this.currentWeapon.isActive;
			this.currentWeapon.stopShot();
		}
		this.currentWeapon = weapon;
		this.currentWeapon.enable();

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
