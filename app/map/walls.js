import CollisionResolver from '../collisionResolver.js';
import Hitbox from '../collisionHitbox.js';

class Wall {
    constructor() {
        CollisionResolver.addToLayer(this, 'WALLS');
    }

    getWorldCollisionBox() {
		return this.hitBox;
	}

    dispose() {
        CollisionResolver.removeFromLayer(this, 'WALLS');
        this.hitBox.dispose();
    }
}

export class UpWall extends Wall {
    constructor() {
        super();
        this.hitBox = new Hitbox(-80, 80, 57, 70, true);
    }
}

export class BottomWall extends Wall {
    constructor() {
        super();
        this.hitBox = new Hitbox(-80, 80, -70, -57, true);
    }
}

export class LeftWall extends Wall {
    constructor(groundPosition) {
        super();
        this.hitBox = new Hitbox(-80, -77, -70, 70, true);
    }
}

export class RightWall extends Wall {
    constructor(groundPosition) {
        super();
        this.hitBox = new Hitbox(77, 80, -70, 70, true);
    }
}