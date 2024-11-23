import * as Sound from '../sound.js';
import * as Utils from '../utils/misc.js';

const soundsLoaded = {};
let loadingId = null;
let soundsList;

export function get(_id) {
	if (!soundsLoaded[_id]) {
		return null;
	}
	return soundsLoaded[_id];
}

export function play(id, volume = 1) {
	this.get(id).play(volume);
}

export function playRandom(idsList, volume = 1) {
	const soundToPlay = Utils.randomElement(idsList);
	this.get(soundToPlay).play(volume);
}

export function loadBatch(list) {
	soundsList = list;
	return new Promise((resolveCallback) => {
		loadNextSound(resolveCallback);
	});
}
	
function loadNextSound(resolveCallback) {
	const nextSound = soundsList.shift();
	loadingId = nextSound.id;
	const sound = new Sound.Sound(nextSound.url);

	sound.load().then(() => {
		soundsLoaded[loadingId] = sound;

		if (soundsList.length === 0) {
			resolveCallback();
		} else {
			loadNextSound(resolveCallback);
		}
	})
}