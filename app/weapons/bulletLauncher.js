import Bullet from './bullet.js';
import * as SoundLoader from './../net/loaderSound.js';
import Weapon from './baseWeapon.js';

export class BulletLauncher extends Weapon {
	constructor() {
		super(10);
		this.icon = 'bullet';
		this.ammo = 20;
	}

	launchProjectile() {
		super.launchProjectile();

		console.log('launchProjectile A', this.ammo);
		
		if (this.ammo === 0) {
			return;
		}
		console.log('launchProjectile B');
		SoundLoader.play('eggLaunch');
		const arrow = new Bullet(this.owner.position.x, this.owner.position.y, this.owner.viewAngle, this.owner);
		super.launchProjectile();
	}
}

export {BulletLauncher as default};