import * as AnimationControl from './animationControl.js';

class EntityWithStates {
	constructor(states) {
		this.currentState = null;
		this.states = states;

		for (const state of this.states.values()) {
			state.setEntity(this);
		}
		
		this.setState('ENTER');
		
		AnimationControl.registerToUpdate(this);
	}

	setState(stateKey) {
		this.currentState = this.states.get(stateKey);
		this.currentState.start();
	}

    getState() {
		return this.currentState;
	}

	update(step, time) {
		this.currentState.update(time);
	}

	dispose() {
		AnimationControl.unregisterToUpdate(this);
		for (const state of this.states.values()) {
			state.dispose();
		}
	}
}

export {EntityWithStates as default};