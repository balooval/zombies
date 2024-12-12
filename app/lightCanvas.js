import * as AnimationControl from './animationControl.js';
import * as MATH from './utils/math.js';
import * as TextureLoader from './net/loaderTexture.js';

import CollisionResolver from './collisionResolver.js';

class LightCanvas {

	constructor() {
		this.canvasTempLight = null;
		this.contextTempLights = null;

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

		this.canvasTempLight = new OffscreenCanvas(width, height);
		this.contextTempLights = this.canvasTempLight.getContext('2d');
		this.contextTempLights.fillStyle = '#000000';
		this.contextTempLights.fillRect(0, 0, this.width, this.height);
		
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
		const finalWidth = pointLight.size / this.ratioW;
		const finalHeight = pointLight.size / this.ratioH;

        this.contextDynamicLights.drawImage(
			pointLight.textureImage,
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
		const raysCount = 20;
		const angleStep = spotLight.fovAngle / raysCount;
		const lightDistance = 150;

		const polygon = [
			[spotLight.posX, spotLight.posY]
		];

		for (let i = 0; i <= raysCount; i ++) {
			const curAngle = spotLight.angle - (spotLight.fovAngle * 0.5) + (angleStep * i);

			const hitSegment = {
				startX: spotLight.posX,
				startY: spotLight.posY,
				destX: spotLight.posX + Math.cos(curAngle) * lightDistance,
				destY: spotLight.posY + Math.sin(curAngle) * lightDistance,
			};

			const hitPoint = this.#getNearestHit(hitSegment, [hitSegment.destX, hitSegment.destY]);
			
			polygon.push(hitPoint);
		}

		this.contextTempLights.fillStyle = '#000000';
		this.contextTempLights.fillRect(0, 0, this.width, this.height);

		const spotGradient = this.contextDynamicLights.createRadialGradient(
			this.#toLocalX(spotLight.posX),
			this.#toLocalY(spotLight.posY),
			2,
			this.#toLocalX(spotLight.posX),
			this.#toLocalY(spotLight.posY),
			lightDistance * 2
		);
		spotGradient.addColorStop(0, 'rgba(255, 255, 250, 1)');
		spotGradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
		// this.contextDynamicLights.filter = "blur(4px)";
		// this.#fillPolygon(this.contextDynamicLights, polygon, spotGradient);
		
		
		this.#fillPolygon(this.contextTempLights, polygon, spotGradient);

		
		const conicGradient = this.contextTempLights.createConicGradient(
			spotLight.angle * -1 + Math.PI,
			this.#toLocalX(spotLight.posX),
			this.#toLocalY(spotLight.posY)
		);

		const blindFovAngle = 0.5 * ((Math.PI - (spotLight.fovAngle * 0.5)) / Math.PI);
		conicGradient.addColorStop(blindFovAngle, '#000000');
		conicGradient.addColorStop(blindFovAngle * 1.1, '#ffffff');
		conicGradient.addColorStop(1 - blindFovAngle * 1.1, '#ffffff');
		conicGradient.addColorStop(1 - blindFovAngle, '#000000');
		this.contextTempLights.globalCompositeOperation = 'multiply';
		// this.#fillPolygon(this.contextTempLights, polygon, conicGradient);
		this.contextTempLights.fillStyle = conicGradient;
		this.contextTempLights.fillRect(0, 0, this.width, this.height);
		this.contextTempLights.globalCompositeOperation = 'source-over';
		
		

		this.contextDynamicLights.drawImage(this.canvasTempLight, 0, 0);
	}

	#getNearestHit(hitSegment, defaultEnd) {
		const intersections = this.map.getWallsIntersections(hitSegment, 1);
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

	#fillPolygon(context, polygon, color) {
		const points = [...polygon];
		context.fillStyle = color;
		context.beginPath();
		const start = points.shift();
		context.moveTo(this.#toLocalX(start[0]), this.#toLocalY(start[1]));
		for (const point of points) {
			context.lineTo(this.#toLocalX(point[0]), this.#toLocalY(point[1]));
		}
		context.closePath();
		context.fill();
	}

	#drawRay(segment, color) {
		const dist = MATH.segmentDistance(segment);
		const distanceByPhoton = 1.5;
		const photonsCount = dist / distanceByPhoton;
		const lerpStep = 1 / photonsCount;

		let startRadius = 3;
		let alpha = 1;
		const decay = 0.92;
		const diffusion = 1.03;

		// this.contextDynamicLights.globalCompositeOperation = 'lighter';

		for (let i = 0; i < photonsCount; i ++) {
			const pos = MATH.lerpPoint(segment[0], segment[1], lerpStep * i);
			this.#drawPoint(pos[0], pos[1], `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`, startRadius);
			startRadius *= diffusion;
			alpha *= decay;
			
			if (alpha < 0.001) {
				break;
			}
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