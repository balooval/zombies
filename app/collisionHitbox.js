import HitboxDebug from "./hitboxDebug.js";


class Hitbox {
	constructor(left, right, bottom, top, debug = false) {
		this.left = left;
		this.right = right;
		this.bottom = bottom;
		this.top = top;
		this.hitBoxDebug = undefined;
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

	getSegments() {
		return [
			[[this.left, this.top], [this.right, this.top]],
			[[this.right, this.top], [this.right, this.bottom]],
			[[this.right, this.bottom], [this.left, this.bottom]],
			[[this.left, this.bottom], [this.left, this.top]],
		];
	}

	dispose() {
		if (this.hitBoxDebug) {
			this.hitBoxDebug.dispose();
		}
	}
}

export {Hitbox as default};