
export class ActiveWeapon {
	constructor(owner) {
		this.owner = owner;
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
