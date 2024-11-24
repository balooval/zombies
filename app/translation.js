
class Translation {
	constructor() {
		this.startX = 0;
		this.startY = 0;
		this.destX = 0;
		this.destY = 0;
        this.moveX = 0;
        this.moveY = 0;
        this.length = 0;
        this.angle = 0;
	}

    setDirection(startX, startY, normalizedMoveX, normalizedMoveY, moveLength) {
        this.angle = Math.atan2(normalizedMoveY, normalizedMoveX);
		this.startX = startX;
		this.startY = startY;
        this.moveX = Math.cos(this.angle);
        this.moveY = Math.sin(this.angle);
        this.destX = this.startX + this.moveX * moveLength;
		this.destY = this.startY + this.moveY * moveLength;
        this.length = Math.abs(this.moveX) + Math.abs(this.moveY);
	}

    update(startX, startY, destX, destY) {
		this.startX = startX;
		this.startY = startY;
		this.destX = destX;
		this.destY = destY;
        this.moveX = this.destX - this.startX;
        this.moveY = this.destY - this.startY;
        this.length = Math.abs(this.moveX) + Math.abs(this.moveY),
        this.angle = Math.atan2(this.moveY, this.moveX);
	}
}

export {Translation as default};