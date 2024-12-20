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
import {Player} from './player.js';

let gameLevel;
let mapDescription;
let player;
let currentMapFile = 'none';
const loadedMaps = new Map();
const mapPersistance = {};

const defaultMapDescription = {
	fog: [],
	enterPositions: {
		default: {
			x: 0,
			y: 0,
		},
	},
	exits: [],
	zombiesDescriptions: [],
	deadZombies: [],
	zombiesCorpses: [],
	floorBlood: null,
	lights: {
		rectLights: [],
		pointLights: [],
	}
};

export function loadMap(fileName) {
	currentMapFile = fileName;

	if (loadedMaps.has(fileName) === true) {
		return new Promise(resolve => {
			const loadedDescription = loadedMaps.get(fileName);
			mapDescription = applyMapPersistance(loadedDescription);
			resolve()
		});
	}

	return fetch(`./assets/${fileName}`)
	.then(response => response.json())
	.then(loadedMapDescription => {
		mapPersistance[fileName] = {
			deadZombies: [],
			zombiesCorpses: [],
		};
		const defaultDescriptionCopy = JSON.parse(JSON.stringify(defaultMapDescription))
		mapDescription = {...defaultDescriptionCopy, ...loadedMapDescription};
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

function applyMapPersistance(description) {
	description.zombiesCorpses = mapPersistance[currentMapFile].zombiesCorpses;
	description.floorBlood = mapPersistance[currentMapFile].floorBlood;
	description.zombiesDescriptions = description.zombiesDescriptions.filter(zombieDescription => mapPersistance[currentMapFile].deadZombies.includes(zombieDescription.id) === false);
	
	return description;
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
		this.map = new GameMap(mapDescription);
		if (!player) {
			player = new Player(this.map, mapDescription.enterPositions[nextExit]);
		}

		// console.log('this.mapPersistance[currentMapFile]', mapPersistance[currentMapFile]);

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

		this.map.exportBloodCanvas().then(image => {
			mapPersistance[currentMapFile].floorBlood = image;
			this.map.dispose();
			this.map = null;
			return loadMap(nextMap);
		}).then(() => this.#startMap(nextExit));
	}

	persist(type, data) {
		switch (type) {
			case 'ZOMBIE_CORPSE':
				mapPersistance[currentMapFile].zombiesCorpses.push(data);
			break;
			case 'ZOMBIE_DIE':
				mapPersistance[currentMapFile].deadZombies.push(data.id);
			break;
		}
	}

	dispose() {
		this.map.evt.removeEventListener(GAME_OVER_EVENT, this, this.gameOver);
	}
}