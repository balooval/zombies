import * as SoundLoader from '../net/loaderSound.js';

import Grenade from './grenade.js';
import Weapon from './baseWeapon.js';

export class GrenadeLauncher extends Weapon {
	constructor() {
		super(50);
		this.icon = 'grenade';
		this.ammo = 20;
	}

	launchProjectile() {
		super.launchProjectile();
		
		SoundLoader.play('eggLaunch');
		new Grenade(this.owner.position, this.owner.weaponTargetPosition, this.owner);
	}
}

export {GrenadeLauncher as default};