import * as Debug from './debugCanvas.js';
import * as GameLevel from './gameLevel.js';
import * as Input from './input.js';
import * as LoadingScreen from './ui/loadingScreen.js';
import * as Mouse from './inputMouse.js';
import * as Renderer from './renderer.js';
import * as Sound from './sound.js';
import * as SoundLoader from './net/loaderSound.js';
import * as Stepper from './utils/stepper.js';
import * as TextureLoader from './net/loaderTexture.js';

import HomeScreen from './ui/homeScreen.js';
import LightCanvas from './lightCanvas.js';
import {init as TextureAnimationInit} from './textureAnimation.js';

Input.init();
Mouse.init('main', Renderer.worldWidth, Renderer.worldHeight);

const homeScreen = new HomeScreen('main');
homeScreen.evt.addEventListener('LAUNCH_GAME', null, init);
Input.evt.addEventListener('DOWN', null, onKeyDown);

function onKeyDown(code) {
	switch (code) {
		case 'SPACE':
			Input.evt.removeEventListener('DOWN', null, onKeyDown);
			homeScreen.launchGame();
		break;
	}
}

function init() {
	homeScreen.evt.removeEventListener('LAUNCH_GAME', null, init);
	Debug.init('debugCanvas');
	Sound.init();
	LoadingScreen.display('main');
	loadRessourcesList('./app/ressources.json')
	.then(onRessourcesLoaded);
}

function loadRessourcesList(ressourcesUrl) {
	return fetch(ressourcesUrl)
	.then(response => response.json())
	.then(ressourcesList => Promise.all([
		SoundLoader.loadBatch(ressourcesList.sounds),
		TextureLoader.loadBatch(ressourcesList.textures),
		GameLevel.loadMap('level-1.json')
		// GameLevel.loadMap('map-2.json')
		// GameLevel.loadMap('map-shadow.json')
	]));
}

function onRessourcesLoaded() {
	LoadingScreen.hide();
	LightCanvas.init(320, 240, Renderer.worldWidth, Renderer.worldHeight);
	Renderer.init('main');
	TextureAnimationInit();
	Stepper.init();
	startGame();

	Input.evt.addEventListener('DOWN', null, onKeyDown);
}

function startGame() {
	const gameLevel = GameLevel.getNextLevel();
	gameLevel.start();
}