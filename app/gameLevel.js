import * as AnimationControl from './animationControl.js';
import * as Input from './input.js';
import * as Renderer from './renderer.js';
import * as Stepper from './utils/stepper.js';
import * as Clock from './utils/clock.js';
import {
	MapNight,
	GAME_OVER_EVENT,
}  from './map/map.js';
import GameOverScreen from './ui/gameOverScreen.js';

let gameLevel;

export function getNextLevel() {
	gameLevel = new GameLevel();
	return gameLevel;
}

export function getCurrentLevel() {
	return gameLevel;
}

class GameLevel {

	constructor() {
		this.map = null;
	}

	start() {
		AnimationControl.registerToUpdate(Stepper);
		Renderer.start();
		AnimationControl.start();
		this.map = new MapNight();
		this.map.start();
		this.map.evt.addEventListener(GAME_OVER_EVENT, this, this.gameOver);
		Clock.start();

		Input.evt.addEventListener('DOWN_80', null, this.onPressPause); // P
		Input.evt.addEventListener('DOWN_66', this.map, this.map.addBonus); // B
	}

	success() {
		// TODO
	}

	gameOver() {
		const gameOverScreen = new GameOverScreen();
		Input.evt.removeEventListener('DOWN_80', null, this.onPressPause); // P
		Clock.switchPause();
	}

	onPressPause() {
		console.log('PAUSE');
		Clock.switchPause();
	}
	
	testDisposeMap() {
		map.dispose();
	}

	dispose() {
		this.map.evt.removeEventListener(GAME_OVER_EVENT, this, this.gameOver);
	}
}