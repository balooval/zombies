import Bomb from './bomb.js';
import * as SoundLoader from './../net/loaderSound.js';
import Weapon from './baseWeapon.js';

export class BombLauncher extends Weapon {
	constructor() {
		super(50);
		this.icon = 'bullet';
		this.ammo = 20;
	}

	launchProjectile() {
		SoundLoader.play('eggLaunch');
		new Bomb(this.owner.position, this.owner.weaponTargetPosition, this.owner);
		super.launchProjectile();
	}
}

export {BombLauncher as default};