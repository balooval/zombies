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

	dispose() {
		if (this.hitBoxDebug) {
			this.hitBoxDebug.dispose();
		}
	}
}

export {Hitbox as default};