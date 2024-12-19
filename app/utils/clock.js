

export let isPaused = true;
let pauseTotalDuration = 0;
let lastPauseTime = 0;
let startTime = 0;
let currentPlayTime = 0;

export function start() {
	isPaused = false;
	startTime = getCurrentTime();
}

export function switchPause() {
	isPaused = !isPaused;

	if (isPaused === true) {
		pause();
	} else {
		play();
	}
}

export function play() {
	if (isPaused === false) {
		return;
	}

	isPaused = false;
	pauseTotalDuration += getCurrentTime() - lastPauseTime;
}

export function pause() {
	if (isPaused === true) {
		return;
	}

	isPaused = true;
	lastPauseTime = getCurrentTime();
}

export function getPlayTime() {
	if (isPaused === true) {
		return currentPlayTime;
	}
	currentPlayTime = getCurrentTime() - startTime - pauseTotalDuration;
	return currentPlayTime;
}

function getCurrentTime() {
	const d = new Date();
	return d.getTime();
}