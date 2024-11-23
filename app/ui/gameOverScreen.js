import * as SpriteFactory from '../spriteFactory.js';

class GameOverScreen {
    constructor() {
        this.sprite = SpriteFactory.createAnimatedSprite(162, 120, 'screenGameOver');
        this.sprite.setDepth(50)
    }
}

export {GameOverScreen as default};