import * as AnimationControl from './animationControl.js';
import * as Clock from './utils/clock.js';
import * as Input from './input.js';
import * as Renderer from './renderer.js';
import * as Stepper from './utils/stepper.js';

import {
	GAME_OVER_EVENT,
	GameMap,
}  from './map/map.js';

import GameOverScreen from './ui/gameOverScreen.js';

let gameLevel;
let mapDescription;

export function loadMap(fileName) {
	return fetch(`./assets/${fileName}`)
	.then(response => response.json())
	.then(loadedMapDescription => {
		mapDescription = loadedMapDescription;
	});
}

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
		this.map = new GameMap(mapDescription);
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
		Clock.switchPause();
	}
	
	testDisposeMap() {
		map.dispose();
	}

	dispose() {
		this.map.evt.removeEventListener(GAME_OVER_EVENT, this, this.gameOver);
	}
}