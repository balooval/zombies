import Evt from './event.js';
import * as Clock from './clock.js';

const stepBySec = 60;
	
export let evt = null;
export let curStep = 0;

export function init() {
	evt = new Evt();
}

export function listenStep(step, obj, callback) {
	evt.addEventListener('STEP_' + Math.trunc(step), obj, callback);
}

export function stopListenStep(step, obj, callback) {
	evt.removeEventListener('STEP_' + Math.trunc(step), obj, callback);
}

export function clearListenStep(obj) {
	evt.clearEventListener(obj);
}

export function update() {
	const nextStep = Math.trunc((Clock.getPlayTime() / 1000) * stepBySec);
	for (let lastStep = curStep; lastStep < nextStep; lastStep ++) {
		evt.fireEvent('STEP_' + lastStep, lastStep);
	}
	curStep = nextStep;
}
		