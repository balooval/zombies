import * as AnimationControl from './animationControl.js';

class EntityWithStates {

	constructor(states) {
		this.currentState = null;
		this.states = states;
		this.isDisposed = false;

		for (const state of this.states.values()) {
			state.setEntity(this);
		}
		
		this.setState('ENTER');
		
		AnimationControl.registerToUpdate(this);
	}

	setState(stateKey, params) {
		if (this.isDisposed === true) {
			return;
		}
		if (this.currentState !== null) {
			this.currentState.suspend();
		}
		this.currentState = this.states.get(stateKey);
		this.currentState.start(params);
	}

    getState() {
		return this.currentState;
	}

	update(step, time) {
		this.currentState.update(step, time);
	}

	dispose() {
		this.isDisposed = true;
		AnimationControl.unregisterToUpdate(this);
		
		for (const state of this.states.values()) {
			state.dispose();
		}

	}
}

export {EntityWithStates as default};