import * as MATH from './utils/math.js';

import HitboxDebug from "./hitboxDebug.js";

class Hitbox {
	constructor(left, right, bottom, top, debug = false) {
		this.left = left;
		this.right = right;
		this.bottom = bottom;
		this.top = top;
		this.hitBoxDebug = undefined;

		this.segments = this.#buildSegments();
		
		if (debug === true) {
			// this.hitBoxDebug = new HitboxDebug(this.left, this.right, this.bottom, this.top)
		}
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

	#buildSegments() {
		return this.getSegments().map(segment => {
			const normal = MATH.segmentNormal(segment);
			return {
				middle: MATH.lerpPoint(segment[0], segment[1], 0.5),
				positions: segment,
				normal: normal,
				normalAngle: Math.atan2(normal[1], normal[0]),
			}
        })
	}

	getSegments(margin = 0) {
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

export {Hitbox as default};