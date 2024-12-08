import * as Bonus from '../bonus.js';
import * as Debug from '../debugCanvas.js';
import * as Light from '../light.js';
import * as MATH from '../utils/math.js';
import * as Renderer from '../renderer.js';
import * as SpriteFactory from '../spriteFactory.js';
import * as Stepper from '../utils/stepper.js';
import * as TextureLoader from '../net/loaderTexture.js';
import * as Zombi from '../zombi/zombi.js';

import { CanvasTexture, NearestFilter, Vector2 } from '../../vendor/three.module.js';
import {
    PLAYER_IS_DEAD_EVENT,
    Player
} from '../player.js';

import AstarBuilder from '../astar/AStarBuilder.js';
import Block from './block.js';
import CollisionResolver from '../collisionResolver.js';
import Evt from '../utils/event.js';
import Hitbox from '../collisionHitbox.js';
import InteractiveBlock from './interactiveBlock.js';
import { getIntersection } from '../intersectionResolver.js';

export const GAME_OVER_EVENT = 'GAME_OVER_EVENT';
export const WOLF_TOUCH_GROUND_EVENT = 'WOLF_TOUCH_GROUND_EVENT';

export const WIDTH = 160;
export const HEIGHT = 120;
const MIN_X = -80;
const MAX_X = 80;
const MIN_Y = -60;
const MAX_Y = 60;
export const GROUND_POSITION = -50;
export const PLAYER_POSITION_X = 60;
export const PLAYER_MIN_POS_X = -75;
export const PLAYER_MAX_POS_X = 75;
export const PLAYER_MIN_POS_Y = -55;
export const PLAYER_MAX_POS_Y = 55;


export class GameMap {
    constructor(mapDescription) {
        this.evt = new Evt();
 
        this.texture = null;
        this.context = null;
        this.#createMapTexture(mapDescription.backgroundImage);
        this.sprite = SpriteFactory.createSiilSprite(160, 120, this.texture);

        CollisionResolver.addToLayer(this, 'MAP');
        this.hitBox = new Hitbox(-8000, 8000, GROUND_POSITION - 20, GROUND_POSITION, true);
        this.player = null;
        this.playerStartPosition = new Vector2(mapDescription.playerStartPosition.x, mapDescription.playerStartPosition.y);

        this.addBonusRate = mapDescription.bonus.addBonusRate;
        this.maxBonusCount = mapDescription.bonus.maxBonusCount;
        this.bonusChoices = mapDescription.bonus.choices;

        this.addZombiRate = mapDescription.addZombiRate;
        this.maxZombiesCount = mapDescription.maxZombiesCount;

        this.blocks = this.#buildBlocks(mapDescription.blocks);
        this.rootCell = this.#buildGraph();
        this.navigationGrid = this.#buildNavigationGrid(this.rootCell);

        Debug.drawNavigationGrid(this.navigationGrid);

        const astarBuilder = new AstarBuilder();
        this.astar = astarBuilder.build();

        this.placeLights(mapDescription.lights);
    }

    placeBlood(x, y) {
        const textureId = MATH.randomElement(['bloodSplash', 'bloodSplashB'])
        const textureImage = TextureLoader.get(textureId).image;
        const angle = MATH.randomDirection(3);
        const size = MATH.randomDiff(16, 4);

        this.context.globalCompositeOperation = 'overlay';
        
        Renderer.drawRotatedImage(
            this.context,
            textureImage,
            angle,
            Renderer.toCustomLocalX(x, 320),
            Renderer.toCustomLocalY(y, 240),
            size,
            size
        );

    	this.context.globalCompositeOperation = 'source-over';
        
        this.texture.needsUpdate = true;
    }

    #createMapTexture(backgroundImage) {
        const canvas = new OffscreenCanvas(321, 240);
        this.context = canvas.getContext('2d');
        const textureImage = TextureLoader.get(backgroundImage).image;
        this.context.drawImage(textureImage, 0, 0);
        
        this.texture = new CanvasTexture(canvas);
        this.texture.magFilter = NearestFilter;
        this.texture.minFilter = NearestFilter;
    }

    placeLights(lightsDescription) {
        for (const pointLights of lightsDescription.pointLights) {
            const light = new Light.PointLight(pointLights.size, pointLights.x, pointLights.y);
            light.turnOn();
        }

        for (const rectLights of lightsDescription.rectLights) {
            const light = new Light.RectLight(rectLights.x, rectLights.y, rectLights.width, rectLights.height);
            light.turnOn();
        }
    }

    getTravel(startPos, endPos) {
        const positions = [];
        const startCell = this.rootCell.getCellByPosition(startPos.x, startPos.y);
        const endCell = this.rootCell.getCellByPosition(endPos.x, endPos.y);

        const nav = this.astar.launch(this.navigationGrid.get('cell_' + startCell.id), this.navigationGrid.get('cell_' + endCell.id));

        for (const waypoint of nav) {
            positions.push(waypoint.node)
        }

        return positions;
    }

    getCellByPosition(x, y) {
        return this.rootCell.getCellByPosition(x, y);
    }

    getRandomCell() {
        const flat = this.rootCell
            .flat([])
            .filter(cell => cell.blocks.length === 0);

        return MATH.randomElement(flat);
    }

    start() {
        this.player = new Player(this, this.playerStartPosition);
        this.player.evt.addEventListener(PLAYER_IS_DEAD_EVENT, this, this.onPlayerDead);

        this.#addZombi(0);
        this.#addBonus(0);
    }

    #addBonus(step) {
        Stepper.stopListenStep(Stepper.curStep, this, this.#addBonus);
        Stepper.listenStep(Stepper.curStep + this.addBonusRate, this, this.#addBonus);

        if (Bonus.pool.size >= this.maxBonusCount) {
            return;
        }

        const destCell = this.getRandomCell();
        const destPos = destCell.center;

        Bonus.createRandomBonus(this.bonusChoices, destPos, this);
    }

    #addZombi(step) {

        Stepper.stopListenStep(Stepper.curStep, this, this.#addZombi);
        Stepper.listenStep(Stepper.curStep + this.addZombiRate, this, this.#addZombi);

        if (Zombi.pool.size >= this.maxZombiesCount) {
            return;
        }

        const destCell = this.getRandomCell();
		const startPosition = {x: destCell.center.x, y: destCell.center.y};

        Zombi.createZombi(this.player, this, startPosition);
    }

    onPlayerDead() {
        this.evt.fireEvent(GAME_OVER_EVENT);
    }

    getWorldCollisionBox() {
        return this.hitBox;
    }

    getWallsIntersections(segment) {
        const wallHits = this.blocks.map(block => getIntersection(segment, block.hitBox)).filter(res => res);

        const wallHitsWithDistance = wallHits.map(position => {
            return {
                x: position.x,
                y: position.y,
                distance: MATH.distance({ x: segment.startX, y: segment.startY }, position),
            };
        }).sort((hitA, hitB) => Math.sign(hitA.distance - hitB.distance));

        return wallHitsWithDistance;
    }

    dispose() {
        CollisionResolver.removeFromLayer(this, 'MAP');
        this.player.dispose();
        this.sprite.dispose();
    }

    #buildBlocks(blocksDescription) {
        const blocks = [];
        // Pour DEBUG, correspond au schéma papier
        // blocks.push(new Block(-30, 40, 30, 10));
        // blocks.push(new Block(-10, -10, 50, 10));
        // blocks.push(new Block(-30, -25, 30, 10));

        for (const wall of blocksDescription.walls) {
            blocks.push(new Block(wall.x, wall.y, wall.width, wall.height));
        }

        for (const interactiveBlock of blocksDescription.interactiveBlocks) {
            blocks.push(new InteractiveBlock(this, interactiveBlock.x, interactiveBlock.y, interactiveBlock.width, interactiveBlock.height));
        }

        return blocks;
    }

    #buildGraph() {
        let currentCell = new Cell(
            MIN_X,
            MAX_X,
            MIN_Y,
            MAX_Y,
            this.blocks,
        );
        currentCell.buildHorizontalChilds();
        return currentCell;
    }

    #buildNavigationGrid(mainCell) {
        const flatCells = mainCell.flat([]);
        const emptyCells = flatCells.filter(cell => cell.blocks.length === 0);
        emptyCells.forEach(cell => cell.buildConnections(emptyCells));


        const navigationGrid = new Map();

        for (const cell of emptyCells) {
            const x = cell.center.x;
            const y = cell.center.y;
            const index = x + '_' + y;
            const node = new NavigationNode(x, y, 'cell_' + cell.id);
            navigationGrid.set(index, node);

            for (const connection of cell.connections) {
                const x = connection.point[0];
                const y = connection.point[1];
                const index = x + '_' + y;
                const node = new NavigationNode(x, y, cell.id + '_' + connection.cell.id);
                navigationGrid.set(index, node);
            }
        }

        for (const cell of emptyCells) {
            const x = cell.center.x;
            const y = cell.center.y;
            const index = x + '_' + y;
            const cellNode = navigationGrid.get(index);

            for (const connection of cell.connections) {
                const x = connection.point[0];
                const y = connection.point[1];
                const index = x + '_' + y;
                const subNode = navigationGrid.get(index);

                cellNode.addConnection(subNode);
                subNode.addConnection(cellNode);
            }
        }

        const gridArray = [...navigationGrid.values()];
        const res = new Map();
        for (const node of gridArray) {
            res.set(node.id, node);
        }

        return res;
    }
}

let debugId = 0;

class NavigationNode {
    constructor(posX, posY, id) {
        this.x = posX;
        this.y = posY;
        this.id = id;
        this.connections = [];
    }

    addConnection(navigationNode) {
        this.connections.push(navigationNode);
    }

    getSiblings() {
        return this.connections;
    }
}

class Cell {
    constructor(left, right, bottom, top, blocks) {
        this.id = debugId;
        debugId++;
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