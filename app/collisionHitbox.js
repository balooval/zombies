import * as MATH from './utils/math.js';

import HitboxDebug from "./hitboxDebug.js";

export class FakeHitbox {
	constructor() {
		this.segments = [];
	}

	addPosition(x, y) {
		return this;
	}

	getSegments(margin = 0) {
		return [];
	}
	
	getSides() {
		return [];
	}

	containTranslation(translation) {
		return false;
	}

	isInverted() {
		return false;
	}

	dispose() {
		
	}
}

export class Hitbox {
	constructor(left, right, bottom, top, debug = false, normalFactor = 1) {
		this.left = left;
		this.right = right;
		this.bottom = bottom;
		this.top = top;
		this.normalFactor = normalFactor;
		this.hitBoxDebug = undefined;

		this.segments = this.#buildSegments();
		
		if (debug === true) {
			// this.hitBoxDebug = new HitboxDebug(this.left, this.right, this.bottom, this.top)
		}
	}

	containTranslation(translation) {
		if (this.left > Math.max(translation.startX, translation.destX)) return false;
		if (this.right < Math.min(translation.startX, translation.destX)) return false;
		if (this.top < Math.min(translation.startY, translation.destY)) return false;
		if (this.bottom > Math.max(translation.startY, translation.destY)) return false;
		return true;
	}

	addPosition(x, y) {
		if (this.hitBoxDebug) {
			this.hitBoxDebug.setPosition(x, y);
		}

		return new Hitbox(
			this.left + x,
			this.right + x,
			this.bottom + y,
			this.top + y,
		)
	}

	isInverted() {
		return this.normalFactor === -1;
	}

	#buildSegments() {
		return this.getSides().map(segment => {
			const normal = MATH.segmentNormal(segment);
			return {
				middle: MATH.lerpPoint(segment[0], segment[1], 0.5),
				positions: segment,
				normal: normal,
				normalAngle: Math.atan2(normal[1] * this.normalFactor, normal[0] * this.normalFactor),
			}
        })
	}

	getSegments(margin = 0) {
		if (margin === 0) {
			return this.segments;
		}
		
		return this.getSides(margin).map((side, i) => {
			return {
				...this.segments[i],
				positions: side,
			};
		});
	}

	getSides(margin = 0) {
		return [
			[
				[this.left + margin, this.top - margin],
				[this.right - margin, this.top - margin]
			],
			[
				[this.right - margin, this.top - margin],
				[this.right - margin, this.bottom + margin]
			],
			[
				[this.right - margin, this.bottom + margin],
				[this.left, this.bottom + margin]
			],
			[
				[this.left + margin, this.bottom + margin],
				[this.left + margin, this.top - margin]
			],
		];
	}

	#buildNormals() {
        return this.getSegments().map(segment => {
            const normal = MATH.segmentNormal(segment);
            return normal;
        })
    }

	#getNormalsAngles(normals) {
        return normals.map(normal => {
            return Math.atan2(normal[1], normal[0])
        })
    }

	dispose() {
		if (this.hitBoxDebug) {
			this.hitBoxDebug.dispose();
		}
	}
}