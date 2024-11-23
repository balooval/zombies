import * as Stepper from './utils/stepper.js';
import * as Clock from './utils/clock.js';

let run = false;
let registeredToUpdate = [];

export function start() {
	run = true;
	animate();
}

export function registerToUpdate(_object) {
	registeredToUpdate.push(_object);
}

export function unregisterToUpdate(_object) {
	registeredToUpdate = registeredToUpdate.filter(object => object != _object);
}

function animate() {
	requestAnimationFrame(animate);
	
	if (Clock.isPaused === false) {
		registeredToUpdate.forEach(object => object.update(Stepper.curStep, Clock.getPlayTime()));
	}
}
