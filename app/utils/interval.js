import * as Stepper from './stepper.js';

class Interval {

	constructor(stepCount, _callback, startFire = false) {
		this.interval = stepCount;
		this.nextStep = -1;
		this.running = false;
		this.startFire = startFire;
		this.callback = _callback;
		this.waitingForNextStep = false;
	}

	start() {
		this.running = true;
		this.nextStep = Stepper.curStep + this.interval;
		if (this.waitingForNextStep === true) {
			return;
		}
		if (this.startFire) {
			this.onStep(Stepper.curStep);
		} else {
			this.waitingForNextStep = true;
			Stepper.listenStep(this.nextStep, this, this.onStep);
		}
	}
	
	stop() {
		this.running = false;
		// Stepper.stopListenStep(this.nextStep, this, this.onStep);
	}

	setStepCount(stepCount) {
		this.interval = stepCount;
	}

	switch() {
		if (this.running) {
			this.stop();
		} else {
			this.start();
		}
	}

	onStep(step) {
		this.waitingForNextStep = false;
		Stepper.stopListenStep(step, this, this.onStep);
		if (this.running) {
			this.callback();
			this.waitingForNextStep = true;
			Stepper.listenStep(step + this.interval, this, this.onStep);
		}
	}

	dispose() {
		this.stop();
		Stepper.stopListenStep(this.nextStep, this, this.onStep);
	}
}


export {Interval as default};