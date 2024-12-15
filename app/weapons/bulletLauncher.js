import * as SoundLoader from './../net/loaderSound.js';

import Bullet from './bullet.js';
import Weapon from './baseWeapon.js';

export class BulletLauncher extends Weapon {
	constructor(map) {
		super(10);
		
		this.map = map;
		this.icon = 'bullet';
		this.ammo = 60;
	}

	launchProjectile() {
		super.launchProjectile();

		// if (this.canShot() === false) {
		// 	return;
		// }

		SoundLoader.play('eggLaunch');
		const arrow = new Bullet(this.map, this.owner.position.x, this.owner.position.y, this.owner.viewAngle);
		super.launchProjectile();
	}
}

export {BulletLauncher as default};