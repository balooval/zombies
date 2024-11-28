import Bullet from './bullet.js';
import * as SoundLoader from './../net/loaderSound.js';
import Weapon from './baseWeapon.js';

export class BulletLauncher extends Weapon {
	constructor() {
		super(10);
		this.icon = 'bullet';
	}

	launchProjectile() {
		SoundLoader.play('eggLaunch');
		const arrow = new Bullet(this.owner.position.x, this.owner.position.y, this.owner.viewAngle, this.owner);
		super.launchProjectile();
	}
}

export {BulletLauncher as default};