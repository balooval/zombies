import Grenade from './grenade.js';
import * as SoundLoader from './../net/loaderSound.js';
import Weapon from './baseWeapon.js';

export class BombLauncher extends Weapon {
	constructor() {
		super(50);
		this.icon = 'grenade';
		this.ammo = 20;
	}

	launchProjectile() {
		super.launchProjectile();
		
		if (this.canShot() === false) {
			return;
		}
		SoundLoader.play('eggLaunch');
		new Grenade(this.owner.position, this.owner.weaponTargetPosition, this.owner);
		super.launchProjectile();
	}
}

export {BombLauncher as default};