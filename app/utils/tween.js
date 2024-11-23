import Evt from './event.js';
import * as Clock from './clock.js';

export const TWEEN_END_EVENT = 'TWEEN_END_EVENT';

export class TweenValue {

	constructor(value = 0) {
		this.value = value;
		this.valueStart = this.value;
		this.valueEnd = 0;
		this.timeStart = -1;
		this.timeEnd = -1;
		this.timeTotal = -1;
		this.running = false;
		this.evt = new Evt();
	}

	setTargetValue(value, duration) {
		const curTime = Clock.getPlayTime();
		this.valueStart = this.value;
		this.valueEnd = value;
		this.timeStart = curTime;
		this.timeEnd = curTime + duration;
		this.timeTotal = this.timeEnd - this.timeStart;
		this.running = true;
	}
	
	getValueAtTime(curTime) {
		this.timeTotal = this.timeEnd - this.timeStart;
		const timeElapsed = curTime - this.timeStart;
		const timePrct = (timeElapsed / this.timeTotal);
		const delta = this.valueEnd - this.valueStart;
		this.value = this.valueStart + (delta * (timePrct));
		if(timePrct >= 1){
			this.reachTargetValue();
		}
		return this.value;
	}

	reachTargetValue() {
		this.value = this.valueEnd;
		this.valueStart = this.valueEnd;
		this.timeEnd = -1;
		this.timeTotal = -1;
		this.running = false;
		this.evt.fireEvent(TWEEN_END_EVENT);
	}
}