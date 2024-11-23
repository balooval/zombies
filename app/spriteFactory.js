import * as Renderer from './renderer.js';
import {
    SpriteBase,
    AnimatedSprite,
    FlatSprite
} from './sprite.js';

export function createAnimatedSprite(width, height, animationId) {
    return new AnimatedSprite(Renderer, width, height, animationId);
}

export function createDummySprite() {
    return new SpriteBase();
}

export function createFlatSprite(x, y, color) {
    const spriteFromPool = flatSpritesPool.filter(sprite => sprite.isAlive === false).pop();

    if (spriteFromPool) {
        spriteFromPool.reset(x, y, color);
        return spriteFromPool;
    }

    const freshSprite = new FlatSprite(Renderer, x, y, color);
    flatSpritesPool.push(freshSprite);

    return freshSprite;
}


const flatSpritesPool = [];