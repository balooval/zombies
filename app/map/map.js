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
import * as MATH from '../utils/math.js';

export const GAME_OVER_EVENT = 'GAME_OVER_EVENT';
export const WOLF_TOUCH_GROUND_EVENT = 'WOLF_TOUCH_GROUND_EVENT';

export const WIDTH = 160;
export const HEIGHT = 120;
const MIN_X = -80; 
const MAX_X = 80; 
const MIN_Y = -60; 
const MAX_Y = 60; 
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
        
        this.blocks = this.#buildBlocks();
        this.grid = this.#buildGrid();

        console.log(this.grid);
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
		zombiStates.set('ENTER', new Zombi.ZombiStateTravelCells(startPosition, this.grid));
		// zombiStates.set('ENTER', new Zombi.ZombiStateFollow(startPosition, this.player));
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

    #buildBlocks() {
        const blocks = [];
        blocks.push(new Block(-30, 40, 30, 10));
        blocks.push(new Block(-10, -10, 50, 10));
        blocks.push(new Block(-30, -25, 30, 10));
        return blocks;
    }

    #buildGrid() {
        let currentCell = new Cell(
            MIN_X,
            MAX_X,
            MIN_Y,
            MAX_Y,
            this.blocks,
        );
        currentCell.buildHorizontalChilds();
        console.log(currentCell);
        const flatCells = currentCell.flat([]);
        flatCells.forEach(cell => cell.buildConnections(flatCells));
        console.log('FLAT', flatCells);

        return currentCell;
    }
}

let debugId = 0;

class Cell {
    constructor(left, right, bottom, top, blocks) {
        this.id = debugId;
        debugId ++;
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.width = Math.abs(this.right - this.left);
        this.height = Math.abs(this.top - this.bottom);

        this.center = {
            x: this.left + (this.right - this.left) / 2,
            y: this.bottom + (this.top - this.bottom) / 2,
        };
        this.blocks = this.#cleanBlocks(blocks);
        this.childs = [];
        this.connections = [];
    }

    flat(res) {
        if (this.childs.length === 0) {
            res.push(this);
            return res;
        }
        
        for (const child of this.childs) {
            const childRes = child.flat(res);
            res = childRes;
        }

        return res;
    }

    getCellByPosition(posX, posY) {
        if (this.left > posX) {
            return null;
        }
        if (this.right < posX) {
            return null;
        }
        if (this.bottom > posY) {
            return null;
        }
        if (this.top < posY) {
            return null;
        }

        if (this.childs.length === 0) {
            return this;
        }

        return this.childs
        .map(child => child.getCellByPosition(posX, posY))
        .filter(cell => cell !== null)
        .pop();
    }

    buildConnections(flatCells) {
        for (const cell of flatCells) {


            
            const touchLeft = this.left === cell.right;
            const touchRight = this.right === cell.left;
            const touchBottom = this.bottom === cell.top;
            const touchTop = this.top === cell.bottom;
            const contacts = [
                touchLeft,
                touchRight,
                touchBottom,
                touchTop,
            ];
            
            if (contacts.some(value => value === true) === false) {
                continue;
            }

            const bottomMatch = this.bottom < cell.top;
            const topMatch = this.top > cell.bottom;

            if (bottomMatch && topMatch) {
                this.#createHorConnection(cell);
                continue;
            }
            
            if (this.left !== cell.left) {
                continue;
            }
            
            if (touchBottom || touchTop) {
                this.#createVertConnection(cell);
                continue;
            }
        }
    }

    #createVertConnection(connectedCell) {
        const point = [
            MATH.lerpFloat(this.left, this.right, 0.5),
            0
        ];
        
        if (this.top < connectedCell.top) {
            point[1] = this.top;
        }

        if (this.bottom > connectedCell.bottom) {
            point[1] = this.bottom;
        }

        this.#createConnection(connectedCell, point);
    }

    #createHorConnection(connectedCell) {
        const point = [
            this.left,
            MATH.lerpFloat(connectedCell.bottom, connectedCell.top, 0.5)
        ];
        
        if (this.right < connectedCell.right) {
            point[0] = this.right;
        }

        if (this.height < connectedCell.height) {
            point[1] = MATH.lerpFloat(this.bottom, this.top, 0.5);
        }

        this.#createConnection(connectedCell, point);
    }

    #createConnection(connectedCell, point) {
        this.connections.push({
            cell: connectedCell,
            point: point,
        });
    }

    buildHorizontalChilds() {

        let horPositions = this.blocks.map(block => [block.posX, block.posX + block.width]).flat();
        horPositions.push(this.right);
        horPositions = [...new Set(horPositions)];
        horPositions = horPositions.toSorted((xA, xB) => Math.sign(xA - xB));
        console.log('horPositions', horPositions);

        let prevLeft = this.left;
        
        for (const posX of horPositions) {
            const child = new Cell(
                prevLeft,
                posX,
                this.bottom,
                this.top,
                this.blocks,
            );
            child.buildVerticalChilds();
            this.childs.push(child);
            prevLeft = posX;
        }
    }

    buildVerticalChilds() {

        let vertPositions = this.blocks.map(block => [block.posY, block.posY - block.height]).flat();
        vertPositions.push(this.top);
        vertPositions = [...new Set(vertPositions)];
        vertPositions = vertPositions.toSorted((xA, xB) => Math.sign(xA - xB));
        console.log('vertPositions', this.id, vertPositions);

        let prevBottom = this.bottom;
        
        for (const posY of vertPositions) {
            this.childs.push(new Cell(
                this.left,
                this.right,
                prevBottom,
                posY,
                this.blocks,
            ));
            prevBottom = posY;
        }
    }

    #cleanBlocks(blocks) {
        return blocks.filter(block => {
            if (block.posX >= this.right) return false;
            if (block.posX + block.width <= this.left) return false;
            if (block.posY <= this.bottom) return false;
            if (block.posY - block.height >= this.top) return false;
            return true;
        });
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
