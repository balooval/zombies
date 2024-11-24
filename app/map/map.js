import {Vector2} from '../../vendor/three.module.js';
import Evt from '../utils/event.js';
import CollisionResolver from '../collisionResolver.js';
import {
    Player,
    PLAYER_IS_DEAD_EVENT
} from '../player.js';
import Hitbox from '../collisionHitbox.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as Zombi from '../zombi.js';
import * as Stepper from '../utils/stepper.js';
import * as Walls from './walls.js';
import * as Utils from '../utils/misc.js';

export const GAME_OVER_EVENT = 'GAME_OVER_EVENT';
export const WOLF_TOUCH_GROUND_EVENT = 'WOLF_TOUCH_GROUND_EVENT';

export const WIDTH = 160;
export const HEIGHT = 120;
export const GROUND_POSITION = -50;
export const GROUND_LIMITE_X_MIN = -65;
export const GROUND_LIMITE_X_MAX = 65;
export const ENEMIES_START_POSITION = new Vector2(-80, 52);
export const ENEMIES_FALL_MAX_POSITION = 70;
export const ENEMIES_GOAL_POSITION = 70;
export const PLAYER_POSITION_X = 60;
export const PLAYER_START_POSITION = new Vector2(60, 20);
export const PLAYER_MIN_POS_X = -75;
export const PLAYER_MAX_POS_X = 75;
export const PLAYER_MIN_POS_Y = -55;
export const PLAYER_MAX_POS_Y = 55;


export class GameMap {
    constructor() {
        const spriteType = 'Night';
        this.evt = new Evt();
        this.sprite = SpriteFactory.createAnimatedSprite(162, 120, 'mapBackground' + spriteType);
        this.skySprite = SpriteFactory.createAnimatedSprite(162, 120, 'mapSky' + spriteType);
        this.skySprite.setDepth(-10);
        CollisionResolver.addToLayer(this, 'MAP');
        this.hitBox = new Hitbox(-8000, 8000, GROUND_POSITION - 20, GROUND_POSITION, true);
        this.leftWall = new Walls.LeftWall(GROUND_POSITION);
        this.rightWall = new Walls.RightWall(GROUND_POSITION);
        this.upWall = new Walls.UpWall();
        this.bottomWall = new Walls.BottomWall();
        this.bonusStep = 0;
        this.addZombiRate = 80;
        this.player = null;
        this.blocks = this.buildBlocks();
    }

    buildBlocks() {
        const blocks = [];
        blocks.push(new Block(0, 0, 10, 50));
        return blocks;
    }
    
    start() {
        this.player = new Player(this);
        this.player.evt.addEventListener(PLAYER_IS_DEAD_EVENT, this, this.onPlayerDead);

        this.#addZombi(0);
    }

    #addZombi(step) {
        const zones = [
            // TOP
            {
                minX: -80,
                maxX: 80,
                minY: 60,
                maxY: 60,
            },
            // BOTTOM
            {
                minX: -80,
                maxX: 80,
                minY: -60,
                maxY: -60,
            },
            // LEFT
            {
                minX: -80,
                maxX: -80,
                minY: -60,
                maxY: 60,
            },
            // RIGHT
            {
                minX: 80,
                maxX: 80,
                minY: -60,
                maxY: 60,
            },
        ];

        const zone = Utils.randomElement(zones);
        const startX = Utils.randomValue(zone.minX, zone.maxX);
        const startY = Utils.randomValue(zone.minY, zone.maxY);
        const startPosition = {x: startX, y: startY};
        const zombiStates = new Map();
		zombiStates.set('ENTER', new Zombi.ZombiStateFollow(startPosition, this.player));
		zombiStates.set('SLIDE', new Zombi.ZombiStateSlide(startPosition));
		const zombi = new Zombi.Zombi(zombiStates);

        Stepper.stopListenStep(step, this, this.#addZombi);
		Stepper.listenStep(Stepper.curStep + this.addZombiRate, this, this.#addZombi);
    }

    onPlayerDead() {
        this.evt.fireEvent(GAME_OVER_EVENT);
    }

    getWorldCollisionBox() {
		return this.hitBox;
	}

    dispose() {
        CollisionResolver.removeFromLayer(this, 'MAP');
        Stepper.stopListenStep(this.bonusStep, this, this.addBonus);
        this.player.dispose();
        this.sprite.dispose();
        this.skySprite.dispose();
        this.upWall.dispose();
        this.bottomWall.dispose();
        this.leftWall.dispose();
        this.rightWall.dispose();
    }
}

class Block {
    constructor(posX, posY, width, height) {
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.hitBox = new Hitbox(this.posX, this.posX + this.width, this.posY - this.height, this.posY, true);
        this.sprite = SpriteFactory.createFlatRectangleSprite(
            this.posX + this.width / 2,
            this.posY - this.height / 2,
            this.width,
            this.height,
            0x102030
        );

        CollisionResolver.addToLayer(this, 'WALLS');
    }

    getWorldCollisionBox() {
		return this.hitBox;
	}
}
