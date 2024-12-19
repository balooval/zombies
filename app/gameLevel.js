import * as AnimationControl from './animationControl.js';
import * as Clock from './utils/clock.js';
import * as Input from './input.js';
import * as Renderer from './renderer.js';
import * as Stepper from './utils/stepper.js';

import {
	DISPOSE_EVENT,
	GAME_OVER_EVENT,
	GameMap,
}  from './map/map.js';

import GameOverScreen from './ui/gameOverScreen.js';
import {Player} from './player.js';

let gameLevel;
let mapDescription;
let player;
const loadedMaps = new Map();

const defaultMapDescription = {
	fog: [],
	enterPositions: {
		default: {
			x: 0,
			y: 0,
		},
	},
	exits: [],
	zombiesPositions: [],
	lights: {
		rectLights: [],
		pointLights: [],
	}
};

export function loadMap(fileName) {
	if (loadedMaps.has(fileName) === true) {
		return new Promise(resolve => {
			mapDescription = loadedMaps.get(fileName);
			resolve()
		});
	}

	return fetch(`./assets/${fileName}`)
	.then(response => response.json())
	.then(loadedMapDescription => {
		mapDescription = {...defaultMapDescription, ...loadedMapDescription};
		loadedMaps.set(fileName, mapDescription);
	});
}

export function getNextLevel() {
	gameLevel = new GameLevel();
	return gameLevel;
}

export function getCurrentLevel() {
	return gameLevel;
}

export function getCurrentMap() {
	return gameLevel.map;
}

class GameLevel {

	constructor() {
		this.map = null;
	}

	start() {
		AnimationControl.registerToUpdate(Stepper);
		Renderer.start();
		AnimationControl.start();
		this.#startMap('default', {x: 0, y: 0});
		Clock.start();

		Input.evt.addEventListener('DOWN_80', null, this.onPressPause); // P
	}

	#startMap(nextExit) {
		// console.log('mapDescription', mapDescription);
		this.map = new GameMap(mapDescription);
		if (!player) {
			player = new Player(this.map, mapDescription.enterPositions[nextExit]);
		}
		this.map.start(player, nextExit);
		// Clock.play();
		this.map.evt.addEventListener(GAME_OVER_EVENT, this, this.gameOver);
		Input.evt.addEventListener('DOWN_66', this.map, this.map.dispose); // B
	}

	gameOver() {
		const gameOverScreen = new GameOverScreen();
		Input.evt.removeEventListener('DOWN_80', null, this.onPressPause); // P
		Clock.switchPause();
	}

	onPressPause() {
		Clock.switchPause();
	}

	goToMap(nextMap, nextExit) {
		// Clock.pause();
		this.map.dispose();
		this.map = null;
		loadMap(nextMap).then(() => this.#startMap(nextExit));
	}

	dispose() {
		this.map.evt.removeEventListener(GAME_OVER_EVENT, this, this.gameOver);
	}
}