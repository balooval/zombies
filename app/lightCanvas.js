import * as AnimationControl from './animationControl.js';
import * as MATH from './utils/math.js';
import * as TextureLoader from './net/loaderTexture.js';

import CollisionResolver from './collisionResolver.js';

class LightCanvas {

	constructor() {
		// this.canvasStaticLights = null;
		// this.contextStaticLights = null;

		this.canvasDynamicLights = null;
		this.contextDynamicLights = null;

		this.canvasFinalLights = null;
		this.contextFinalLights = null;

		this.width = 0;
		this.height = 0;
		this.map = null;
	}

	init(width, height, worldWidth, worldHeight) {
		this.width = width;
		this.height = height;
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;
		this.ratioW = this.worldWidth / this.width;
		this.ratioH = this.worldHeight / this.height;
		
		this.canvasFinalLights = new OffscreenCanvas(width, height);
		this.contextFinalLights = this.canvasFinalLights.getContext('2d');
		this.contextFinalLights.fillStyle = '#000000';
		this.contextFinalLights.fillRect(0, 0, this.width, this.height);

		// this.canvasStaticLights = new OffscreenCanvas(width, height);
		// this.contextStaticLights = this.canvasStaticLights.getContext('2d');
		// this.contextStaticLights.fillStyle = '#000000';
		// this.contextStaticLights.fillRect(0, 0, this.width, this.height);
		
		this.canvasDynamicLights = new OffscreenCanvas(width, height);
		this.contextDynamicLights = this.canvasDynamicLights.getContext('2d');
		this.contextDynamicLights.fillStyle = '#000000';
		this.contextDynamicLights.fillRect(0, 0, this.width, this.height);

		
		AnimationControl.registerToUpdate(this);
	}

	setMap(map) {
		this.map = map;
	}

	update(step, time) {
		
		this.contextFinalLights.fillStyle = '#000000';
		this.contextFinalLights.fillRect(0, 0, this.width, this.height);
		
		this.contextFinalLights.drawImage(this.canvasDynamicLights, 0, 0);
		
		this.contextDynamicLights.globalCompositeOperation = 'source-over';

		this.contextDynamicLights.fillStyle = '#000000';
		this.contextDynamicLights.fillRect(0, 0, this.width, this.height);

		this.contextDynamicLights.globalCompositeOperation = 'lighter';
	}

	drawRectLight(rectLight) {
		const textureImage = TextureLoader.get('lightRect').image;
        this.contextDynamicLights.drawImage(
			textureImage,
			0,
			0,
			64,
			64,
			this.#toLocalX(rectLight.posX),
			this.#toLocalY(rectLight.posY),
			rectLight.width / this.ratioW,
			rectLight.height / this.ratioH
		);
	}

	drawPointLight(pointLight) {
		const textureImage = TextureLoader.get('light').image;

		const finalWidth = pointLight.size / this.ratioW;
		const finalHeight = pointLight.size / this.ratioH;

        this.contextDynamicLights.drawImage(
			textureImage,
			0,
			0,
			64,
			64,
			this.#toLocalX(pointLight.posX) - (finalWidth * 0.5),
			this.#toLocalY(pointLight.posY) - (finalHeight * 0.5),
			finalWidth,
			finalHeight
		);
	}

	drawSpotLight(spotLight) {
		const raysCount = 15;
		const angleStep = spotLight.fovAngle / raysCount;
		const lightDistance = 100;

		for (let i = 0; i < raysCount; i ++) {
			const curAngle = spotLight.angle - (spotLight.fovAngle * 0.5) + (angleStep * i);

			const hitSegment = {
				startX: spotLight.posX,
				startY: spotLight.posY,
				destX: spotLight.posX + Math.cos(curAngle) * lightDistance,
				destY: spotLight.posY + Math.sin(curAngle) * lightDistance,
			};

			const hitPoint = this.#getNearestHit(hitSegment, [hitSegment.destX, hitSegment.destY]);
			
			this.#drawRay([[spotLight.posX, spotLight.posY], hitPoint], spotLight.color);
		}
	}

	#getNearestHit(hitSegment, defaultEnd) {
		const intersections = this.map.getWallsIntersections(hitSegment);
		const wallHit = intersections.shift();

		const touched = CollisionResolver.checkIntersectionWithLayer(hitSegment, 'ENNEMIES');
		const zombiHit = touched.shift();

		if (!wallHit && !zombiHit) {
			return defaultEnd;
		}
		
		if (!wallHit && zombiHit) {
			return [zombiHit.point.x, zombiHit.point.y];
		}

		if (wallHit && !zombiHit) {
			return [wallHit.x, wallHit.y];
		}

		if (wallHit.distance < zombiHit.distance) {
			return [wallHit.x, wallHit.y];
		}

		return [zombiHit.point.x, zombiHit.point.y];
	}

	#drawRay(segment, color) {
		const dist = MATH.segmentDistance(segment);
		const distanceByPhoton = 1.5;
		const photonsCount = dist / distanceByPhoton;
		const lerpStep = 1 / photonsCount;

		let startRadius = 2;
		let alpha = 1;
		const decay = 0.88;

		// this.contextDynamicLights.globalCompositeOperation = 'lighter';

		for (let i = 0; i < photonsCount; i ++) {
			const pos = MATH.lerpPoint(segment[0], segment[1], lerpStep * i);
			this.#drawPoint(pos[0], pos[1], `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`, startRadius);
			startRadius *= 1.06;
			alpha *= decay;
		}

		// this.contextDynamicLights.globalCompositeOperation = 'source-over';
	}

	#drawPoint(x, y, color, radius) {
		this.contextDynamicLights.fillStyle = color;
		this.contextDynamicLights.beginPath();
		this.contextDynamicLights.arc(this.#toLocalX(x), this.#toLocalY(y), radius, 0, Math.PI * 2);
		this.contextDynamicLights.closePath();
		this.contextDynamicLights.fill();
	}

	#toLocalX(worldX) {
    	return (worldX + (this.worldWidth * 0.5)) / this.ratioW;
	}
	
	#toLocalY(worldY) {
		return (this.worldHeight + ((worldY + (this.worldHeight * 0.5)) * -1)) / this.ratioH;
	}
}

const lightCanvas = new LightCanvas();

export {lightCanvas as default};