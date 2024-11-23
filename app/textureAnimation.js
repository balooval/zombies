import {BufferAttribute} from '../vendor/three.module.js';
import Evt from './utils/event.js';
import * as AnimationControl from './animationControl.js';
import * as TextureLoader from './net/loaderTexture.js';

export const ANIMATION_END_EVENT = 'ANIMATION_END_EVENT';

export function init() {
	calcSpriteSheetsFrames();
}


function calcSpriteSheetsFrames() {
	for (const [key, spriteSheet] of spriteSheets) {
		const textureImage = TextureLoader.get(spriteSheet.textureId).image;
		const framesCount = Math.floor(textureImage.width / textureImage.height);

		spriteSheet.offsetV = spriteSheet.offsetV ?? 0;
		spriteSheet.offsetV = spriteSheet.offsetV / textureImage.height;

		for (let i = 0; i < framesCount; i ++) {
			spriteSheet.frames.push({
				left: i / framesCount,
				right: (i + 1) / framesCount,
			});
		}
	}

}

export class TextureAnimation {

	constructor(mesh, animationId) {
		this.geometry = mesh.geometry;
		this.material = mesh.material;
		this.mirrorH = false;
		this.lastStep = 0;
		this.updateFunction = this.doNothing;
		AnimationControl.registerToUpdate(this);

		this.evt = new Evt();

		this.animationProps = null;
		this.spriteSheet = null;
		
		this.geometry.setAttribute('uv', new BufferAttribute(new Float32Array([
			0, 0,
			1, 0,
			1, 1,
			0, 1,
		]), 2));

		this.setAnimation(animationId);
	}

	setAnimation(animationId) {
		this.lastStep = -1;
		this.curFrame = 0;
		
		this.animationProps = animations[animationId];
		this.spriteSheet = spriteSheets.get(this.animationProps.spriteSheet);

		const textureId = this.spriteSheet.textureId;
		this.material.map = TextureLoader.get(textureId);
		this.material.needsUpdate = true;

		this.updateFunction = this.doNothing;
		this.displayFrame(this.curFrame);

		if (this.animationProps.stepsByFrame > 0) {
			this.updateFunction = this.updateFrames;
		}
	}

	flipHorizontal() {
		this.mirrorH = !this.mirrorH;
		this.displayFrame(this.curFrame);
	}

	getOffsetV() {
		return spriteSheets.get(this.animationProps.spriteSheet).offsetV;
	}

	update(step, time) {
		this.updateFunction(step, time);
	}

	updateFrames(step, time) {
		const elapsedSteps = step - this.lastStep;
		
		if (elapsedSteps < this.animationProps.stepsByFrame) {
			return;
		}
		
		this.lastStep = step;
		this.passToNextFrame();
	}

	doNothing() {
		
	}

	passToNextFrame() {
		this.curFrame ++;

		if (this.curFrame >= this.animationProps.framesToDisplay.length) {
			this.curFrame = 0;
			this.evt.fireEvent(ANIMATION_END_EVENT);
		}
		
		this.displayFrame(this.curFrame);
		this.evt.fireEvent('FRAME_' + this.curFrame);
	}

	displayFrame(frame) {
		const uvsAttribute = this.geometry.getAttribute('uv');
		const uvs = this.getUvs(frame);
		uvsAttribute.set(uvs)
		uvsAttribute.needsUpdate = true;
	}

	getUvs(frame) {
		const frameToDisplay = this.animationProps.framesToDisplay[frame];
		const frameOffsets = this.spriteSheet.frames[frameToDisplay];
		const bottom = 0;
		const top = 1;

		let left = frameOffsets.left;
		let right = frameOffsets.right;

		if (this.mirrorH === true) {
			left = frameOffsets.right;
			right = frameOffsets.left;
		}

		return new Float32Array([
			left, bottom,
			right, bottom,
			right, top,
			left, top,
		]);
	}

	dispose() {
		AnimationControl.unregisterToUpdate(this);
	}
}

const spriteSheets = new Map(Object.entries({
	screenGameOver: {
		textureId: 'screenGameOver',
		frames: [],
	},
		wolfWalk: {
		textureId: 'wolfWalk',
		frames: [],
	},

	wolfFall: {
		textureId: 'wolfFall',
		offsetV: -14,
		frames: [],
	},

	wolfFallLevel2: {
		textureId: 'wolfFallLevel2',
		offsetV: -14,
		frames: [],
	},

	wolfDeath: {
		textureId: 'wolfDeath',
		frames: [],
	},

	wolfClimb: {
		textureId: 'wolfClimb',
		frames: [],
	},

	wolfBite: {
		textureId: 'wolfBite',
		frames: [],
	},

	poule: {
		textureId: 'pouleAnimation',
		frames: [],
	},

	basket: {
		textureId: 'basket',
		frames: [],
	},

	egg: {
		textureId: 'egg',
		frames: [],
	},

	stone: {
		textureId: 'stone',
		frames: [],
	},

	moon: {
		textureId: 'moon',
		frames: [],
	},
	sun: {
		textureId: 'sun',
		frames: [],
	},

	hit: {
		textureId: 'hit',
		frames: [],
	},

	dust: {
		textureId: 'dust',
		frames: [],
	},
	
	poussin: {
		textureId: 'poussin',
		frames: [],
	},

	mapBackgroundNight: {
		textureId: 'backgroundNight',
		frames: [],
	},
	mapSkyNight: {
		textureId: 'skyNight',
		frames: [],
	},
	mapBackgroundDay: {
		textureId: 'backgroundDay',
		frames: [],
	},
	mapSkyDay: {
		textureId: 'skyDay',
		frames: [],
	},

	bonusFlying: {
		textureId: 'bonusFlying',
		frames: [],
	},
	poussinBonusWalk: {
		textureId: 'poussinBonusWalk',
		frames: [],
	},
	pointer: {
		textureId: 'pointer',
		frames: [],
	},
}));

const animations = {
	poussinBonusWalk: {
		spriteSheet: 'poussinBonusWalk',
		stepsByFrame: 20,
		framesToDisplay: [0, 1, 2],
	},
	bonusFlying: {
		spriteSheet: 'bonusFlying',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	bonusFalling: {
		spriteSheet: 'bonusFlying',
		stepsByFrame: -1,
		framesToDisplay: [1],
	},
	screenGameOver: {
		spriteSheet: 'screenGameOver',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	wolfWalk: {
		spriteSheet: 'wolfWalk',
		stepsByFrame: 10,
		framesToDisplay: [0, 1, 2, 3],
	},

	wolfFall: {
		spriteSheet: 'wolfFall',
		stepsByFrame: 20,
		framesToDisplay: [0, 1],
	},

	wolfFallLevel2: {
		spriteSheet: 'wolfFallLevel2',
		stepsByFrame: 20,
		framesToDisplay: [0, 1],
	},

	wolfDeath: {
		spriteSheet: 'wolfDeath',
		stepsByFrame: 20,
		framesToDisplay: [0, 1],
	},

	wolfDeadGround: {
		spriteSheet: 'wolfDeath',
		stepsByFrame: -1,
		framesToDisplay: [2],
	},

	wolfClimb: {
		spriteSheet: 'wolfClimb',
		stepsByFrame: 30,
		framesToDisplay: [0, 1, 2],
	},

	wolfBiteIdle: {
		spriteSheet: 'wolfBite',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},

	wolfBite: {
		spriteSheet: 'wolfBite',
		stepsByFrame: 20,
		framesToDisplay: [1, 2, 3, 4],
	},

	basket: {
		spriteSheet: 'basket',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},

	pouleIdle: {
		spriteSheet: 'poule',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},

	pouleShot: {
		spriteSheet: 'poule',
		stepsByFrame: 10,
		framesToDisplay: [1, 2],
	},

	pointer: {
		spriteSheet: 'pointer',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},

	eggLaunch: {
		spriteSheet: 'egg',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},

	eggFall: {
		spriteSheet: 'egg',
		stepsByFrame: 10,
		framesToDisplay: [1, 2],
	},

	eggWall: {
		spriteSheet: 'egg',
		stepsByFrame: -1,
		framesToDisplay: [1],
	},

	stoneLaunch: {
		spriteSheet: 'stone',
		stepsByFrame: 10,
		framesToDisplay: [0, 1, 2, 3],
	},

	stoneFall: {
		spriteSheet: 'stone',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},

	moon: {
		spriteSheet: 'moon',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	sun: {
		spriteSheet: 'sun',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},

	hit: {
		spriteSheet: 'hit',
		stepsByFrame: 5,
		framesToDisplay: [2, 3, 4, 5],
	},

	dust: {
		spriteSheet: 'dust',
		stepsByFrame: 5,
		framesToDisplay: [0, 1, 2, 3, 4, 5],
	},

	poussinRun: {
		spriteSheet: 'poussin',
		stepsByFrame: 10,
		framesToDisplay: [0, 1, 2, 3],
	},

	poussinIdle: {
		spriteSheet: 'poussin',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},

	mapBackgroundNight: {
		spriteSheet: 'mapBackgroundNight',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	mapSkyNight: {
		spriteSheet: 'mapSkyNight',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	mapBackgroundDay: {
		spriteSheet: 'mapBackgroundDay',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	mapSkyDay: {
		spriteSheet: 'mapSkyDay',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
};