import {BufferAttribute} from '../vendor/three.module.js';
import Evt from './utils/event.js';
import * as AnimationControl from './animationControl.js';
import * as TextureLoader from './net/loaderTexture.js';
import * as Renderer from './renderer.js';

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
		this.evt = new Evt();
		this.updateFunction = this.doNothing;
		this.animationProps = null;
		this.spriteSheet = null;
		
		AnimationControl.registerToUpdate(this);
		
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

		// this.material.uniforms.lightPosition.value.x = Renderer.light.x;
		// this.material.uniforms.lightPosition.value.y = Renderer.light.y;
		// for (const light of Renderer.lights) {
		// 	this.material.uniforms.lights.value[0].x = light.x;
		// 	this.material.uniforms.lights.value[0].y = light.y;
		// }
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
	zombiWalk: {
		textureId: 'zombiWalk',
		frames: [],
	},
	zombiAtack: {
		textureId: 'zombiWalk',
		frames: [],
	},
	zombiHit: {
		textureId: 'zombiHit',
		frames: [],
	},

	playerWalk: {
		textureId: 'playerWalk',
		frames: [],
	},
	bullet: {
		textureId: 'bullet',
		frames: [],
	},
	playerIdle: {
		textureId: 'playerWalk',
		frames: [],
	},
	egg: {
		textureId: 'egg',
		frames: [],
	},
	hit: {
		textureId: 'hit',
		frames: [],
	},
	mapBackgroundNight: {
		textureId: 'backgroundNight',
		frames: [],
	},
	bonusBullet: {
		textureId: 'bonusBullet',
		frames: [],
	},
	batte: {
		textureId: 'batte',
		frames: [],
	},
	grenade: {
		textureId: 'grenade',
		frames: [],
	},
	bonusGrenade: {
		textureId: 'bonusGrenade',
		frames: [],
	},
	bonusBatte: {
		textureId: 'bonusBatte',
		frames: [],
	},
	bonusMinigun: {
		textureId: 'bonusMinigun',
		frames: [],
	},
	pointer: {
		textureId: 'pointer',
		frames: [],
	},
	hole: {
		textureId: 'hole',
		frames: [],
	},
	mapSkyNight: {
		textureId: 'skyNight',
		frames: [],
	},
	test: {
		textureId: 'test',
		frames: [],
	},
	light: {
		textureId: 'light',
		frames: [],
	},
}));

const animations = {
	light: {
		spriteSheet: 'light',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	test: {
		spriteSheet: 'test',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	grenade: {
		spriteSheet: 'grenade',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	bonusGrenade: {
		spriteSheet: 'bonusGrenade',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	bonusBatte: {
		spriteSheet: 'bonusBatte',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	hole: {
		spriteSheet: 'hole',
		stepsByFrame: 20,
		framesToDisplay: [0, 1, 2, 3, 4, 5, 6, 7],
	},
	bonusMinigun: {
		spriteSheet: 'bonusMinigun',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	batteIdle: {
		spriteSheet: 'batte',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	batteHit: {
		spriteSheet: 'batte',
		stepsByFrame: 3,
		framesToDisplay: [0, 1, 2, 3, 4],
	},
	bonusBullet: {
		spriteSheet: 'bonusBullet',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	screenGameOver: {
		spriteSheet: 'screenGameOver',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	zombiWalk: {
		spriteSheet: 'zombiWalk',
		stepsByFrame: 15,
		framesToDisplay: [0, 1, 2, 3],
	},
	zombiAtack: {
		spriteSheet: 'zombiAtack',
		stepsByFrame: 15,
		framesToDisplay: [4, 4, 5, 4],
	},
	zombiHit: {
		spriteSheet: 'zombiHit',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	bullet: {
		spriteSheet: 'bullet',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	playerWalk: {
		spriteSheet: 'playerWalk',
		stepsByFrame: 15,
		framesToDisplay: [0, 1, 2, 3],
	},
	playerIdle: {
		spriteSheet: 'playerWalk',
		stepsByFrame: -1,
		framesToDisplay: [1],
	},
	pointer: {
		spriteSheet: 'pointer',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	hit: {
		spriteSheet: 'hit',
		stepsByFrame: 5,
		framesToDisplay: [2, 3, 4, 5],
	},
	mapBackgroundNight: {
		spriteSheet: 'mapBackgroundNight',
		stepsByFrame: -1,
		framesToDisplay: [0],
	},
	mapSkyNight: {
		textureId: 'skyNight',
		frames: [],
	},
};