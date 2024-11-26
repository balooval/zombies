
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
        this.lastPosX = 0;
        this.lastPosY = 0;
	}

    reset(posX, posY) {
        this.lastPosX = posX;
        this.lastPosY = posY;
        this.startX = posX;
        this.startY = posY;
        this.updatePosition(posX, posY);    
    }

    updatePosition(posX, posY) {
        this.lastPosX = this.destX;
        this.lastPosY = this.destY;
        this.update(this.lastPosX, this.lastPosY, posX, posY);
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
        this.lastPosX = this.startX;
        this.lastPosY = this.startY;
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