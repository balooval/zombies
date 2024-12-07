import * as SoundLoader from '../net/loaderSound.js';

import Mine from './mine.js';
import Weapon from './baseWeapon.js';

export class MineLauncher extends Weapon {
	constructor() {
		super(50);
		this.icon = 'mineIcon';
		this.ammo = 20;
	}

	launchProjectile() {
		super.launchProjectile();
		
		SoundLoader.play('eggLaunch');
		new Mine(this.owner.position, this.owner.weaponTargetPosition, this.owner);
	}
}

export {MineLauncher as default};