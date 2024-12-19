import * as Bonus from '../bonus.js';
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
import Door from './door.js';
import Evt from '../utils/event.js';
import Exit from './exit.js';
import {FogEmiter} from '../fogEmiter.js';
import {Hitbox} from '../collisionHitbox.js';
import InteractiveBlock from './interactiveBlock.js';
import LightCanvas from '../lightCanvas.js';
import WoodenBox from './woodenBox.js';
import { getIntersection } from '../intersectionResolver.js';

export const GAME_OVER_EVENT = 'GAME_OVER_EVENT';
export const WOLF_TOUCH_GROUND_EVENT = 'WOLF_TOUCH_GROUND_EVENT';
export const DISPOSE_EVENT = 'DISPOSE_EVENT';

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

        this.mapDescription = mapDescription;
        this.texture = null;
        this.canvas = null;
        this.context = null;
        this.#createMapTexture(mapDescription.backgroundImage);
        this.sprite = SpriteFactory.createStillSprite(0, 0, 160, 120, this.texture);

        this.bloodCanvas = new OffscreenCanvas(320, 240);
        this.bloodContext = this.bloodCanvas.getContext('2d', {willReadFrequently: true});
        this.bloodPixels = null;

        CollisionResolver.addToLayer(this, 'MAP');
        this.hitBox = new Hitbox(-8000, 8000, GROUND_POSITION - 20, GROUND_POSITION, true);
        this.player = null;
        this.playerStartPosition = new Vector2(mapDescription.playerStartPosition.x, mapDescription.playerStartPosition.y);

        this.addBonusRate = mapDescription.bonus.addBonusRate;
        this.maxBonusCount = mapDescription.bonus.maxBonusCount;
        this.bonusChoices = mapDescription.bonus.choices;
        this.nextBonusStep = 0;

        this.addZombiRate = mapDescription.addZombiRate;
        this.maxZombiesCount = mapDescription.maxZombiesCount;
        this.nextZombiStep = 0;

        this.blocks = this.#buildBlocks(mapDescription.blocks);
        this.rootCell = this.#buildGraph();
        this.navigationGrid = this.#buildNavigationGrid(this.rootCell);

        this.zombiesSpawnLocations = mapDescription.zombiesSpawnLocations;

        const astarBuilder = new AstarBuilder();
        this.astar = astarBuilder.build();

        LightCanvas.setMap(this);

        this.lights = this.placeLights(mapDescription.lights);
        this.fogEmiters = this.placeFog(mapDescription.fog);

        this.exits = [];
    }

    start(player, nextExit) {
        const startPosition = {
            x: this.mapDescription.enterPositions[nextExit].x,
            y: this.mapDescription.enterPositions[nextExit].y,
        };
        this.player = player;
        this.player.initPosition(startPosition);
        this.player.evt.addEventListener(PLAYER_IS_DEAD_EVENT, this, this.onPlayerDead);

        this.#addBonus(0);
        this.#addZombi(0);
        this.#placeZombies(this.mapDescription.zombiesPositions);
        
        this.exits = this.#buildExits(this.mapDescription.exits);
    }

    onWallsChanged() {
        this.rootCell = this.#buildGraph();
        this.navigationGrid = this.#buildNavigationGrid(this.rootCell);
    }

    placeBlood(x, y, size) {
        const textureId = MATH.randomElement(['bloodSplash', 'bloodSplashB'])
        const textureImage = TextureLoader.get(textureId).image;
        const angle = MATH.randomDirection(3);

        // this.context.globalCompositeOperation = 'overlay';
        
        Renderer.drawRotatedImage(
            this.bloodContext,
            textureImage,
            angle,
            x,
            y,
            size,
            size
        );

    	// this.bloodContext.globalCompositeOperation = 'source-over';
        
        this.texture.needsUpdate = true;
    }

    spreadBlood(x, y, quantity, vector) {
        if (quantity <= 0) {
            return;
        }
        const spreadAngle = 0.5;
        const angle = Math.atan2(vector.y, vector.x);
        const raysCount = quantity * 5;
		const distance = MATH.distance(vector, {x: 0, y: 0}) * 3;
        const distByDrop = quantity;

		for (let i = 0; i <= raysCount; i ++) {
			const curAngle = MATH.randomDiff(angle, spreadAngle);
            const curDist = MATH.randomDiff(distByDrop, distByDrop * 0.4);
            const stepX = Math.cos(curAngle) * curDist;
            const stepY = Math.sin(curAngle) * curDist;
            let alpha = 1;
            let size = 1;
            
            for (let i = 0; i < distance; i += distByDrop) {
                if (Math.random() > 0.9) {
                    continue;
                }
                const dropX = x + stepX * i;
                const dropY = y + stepY * i;
                const color = MATH.randomElement([
                    `rgba(181, 32, 22, ${alpha})`,
                    `rgba(128, 37, 31, ${alpha})`,
                    `rgba(150, 44, 36, ${alpha})`,
                ]);
                this.#drawBloodDrop(Renderer.toCustomLocalX(dropX, 320), Renderer.toCustomLocalY(dropY, 240), size, color);
                alpha *= 0.8;
                size *= 0.9;
            }
        }

        this.#drawBloodIntoBackground();

    }

    #drawBloodDrop(x, y, radius, color) {
        this.bloodContext.fillStyle = color;
        this.bloodContext.beginPath();
        this.bloodContext.arc(x, y, radius, 0, Math.PI * 2);
        this.bloodContext.closePath();
        this.bloodContext.fill();
    }

    #drawBloodIntoBackground() {
        this.bloodPixels = this.bloodContext.getImageData(0, 0, 320, 240).data;
        
        const textureImage = TextureLoader.get(this.mapDescription.backgroundImage).image;
        this.context.drawImage(textureImage, 0, 0);
        this.context.globalCompositeOperation = 'overlay';
        this.context.drawImage(this.bloodCanvas, 0, 0);
    	this.context.globalCompositeOperation = 'source-over';

        this.texture.needsUpdate = true;
    }

    checkBlood(translation) {
        if (this.bloodPixels === null) {
            return;
        }

        if (translation.length === 0) {
            return;
        }

        const localX = Math.round(Renderer.toCustomLocalX(translation.startX, 320));
        const localY = Math.round(Renderer.toCustomLocalY(translation.startY, 240));
        const color = this.#getColorIndicesForCoord(localX, localY);
        
        if (color[3] < 10) {
            return;
        }

        this.bloodContext.globalCompositeOperation = 'destination-out';
        this.#drawBloodDrop(localX, localY, 0.3, `rgba(255, 0, 0, 1)`);
        this.bloodContext.globalCompositeOperation = 'source-over';

        const destX = MATH.randomDiff(Math.round(Renderer.toCustomLocalX(translation.destX, 320)), 2);
        const destY = MATH.randomDiff(Math.round(Renderer.toCustomLocalY(translation.destY, 240)), 2);

        this.#drawBloodDrop(destX, destY, 0.5, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`);

        this.#drawBloodIntoBackground();
    }

    #getColorIndicesForCoord (x, y) {
        const red = y * (320 * 4) + x * 4;
        return [this.bloodPixels[red + 0], this.bloodPixels[red + 1], this.bloodPixels[red + 2], this.bloodPixels[red + 3]];
    };

    #createMapTexture(backgroundImage) {
        this.canvas = new OffscreenCanvas(320, 240);
        this.context = this.canvas.getContext('2d');
        const textureImage = TextureLoader.get(backgroundImage).image;
        this.context.drawImage(textureImage, 0, 0);
        
        this.texture = new CanvasTexture(this.canvas);
        this.texture.magFilter = NearestFilter;
        this.texture.minFilter = NearestFilter;
    }

    placeFog(fogDescription) {
        const fogEmiters = [];
        for (const fog of fogDescription) {
            fogEmiters.push(new FogEmiter(fog.x, fog.y));
        }
        return fogEmiters;
    }

    placeLights(lightsDescription) {
        const lights = [];
        for (const pointLight of lightsDescription.pointLights) {
            const light = new Light.PointLight(pointLight.size, pointLight.x, pointLight.y, pointLight.color);
            light.turnOn();
            lights.push(light);
        }
        
        for (const rectLights of lightsDescription.rectLights) {
            const light = new Light.RectLight(rectLights.x, rectLights.y, rectLights.width, rectLights.height);
            light.turnOn();
            lights.push(light);
        }
        
        return lights;
    }

    getTravel(startPos, endPos) {
        const positions = [];
        const startCell = this.rootCell.getCellByPosition(startPos.x, startPos.y);
        const endCell = this.rootCell.getCellByPosition(endPos.x, endPos.y);

        if (!endCell) {
            console.log('this.rootCell', this.rootCell);
            console.log('endPos', endPos);
            console.warn(startCell);
        }

        const nav = this.astar.launch(this.navigationGrid.get('cell_' + startCell.id), this.navigationGrid.get('cell_' + endCell.id));

        if (nav.length === 0) {
            return [
                new NavigationNode(
                    MATH.random(startCell.left, startCell.right),
                    MATH.random(startCell.bottom, startCell.top),
                    'cell_' + startCell.id,
                    startCell
                )
            ];
        }

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

    #addBonus(step) {
        Stepper.stopListenStep(Stepper.curStep, this, this.#addBonus);
        this.nextBonusStep = Stepper.curStep + this.addBonusRate;
        Stepper.listenStep(this.nextBonusStep, this, this.#addBonus);

        if (Bonus.pool.size >= this.maxBonusCount) {
            return;
        }

        const destCell = this.getRandomCell();
        const destPos = destCell.center;

        Bonus.createRandomBonus(this.bonusChoices, destPos, this);
    }

    #placeZombies(zombiesPositions) {
        for (const zombiePosition of zombiesPositions) {
            this.createZombie(zombiePosition.x, zombiePosition.y, zombiePosition.state);
        }
    }

    #addZombi(step) {
        Stepper.stopListenStep(Stepper.curStep, this, this.#addZombi);
        this.nextZombiStep = Stepper.curStep + this.addZombiRate;
        Stepper.listenStep(this.nextZombiStep, this, this.#addZombi);

        if (Zombi.pool.size >= this.maxZombiesCount) {
            return;
        }

        const startPosition = MATH.randomElement(this.zombiesSpawnLocations);

        this.createZombie(startPosition.x, startPosition.y, 'ENTER');
        // this.createZombie(startPosition.x, startPosition.y, 'STILL_GUARD');
    }

    createZombie(posX, posY, firstState) {
        Zombi.createZombi(this.player, this, {x: posX, y: posY}, firstState);
    }

    onPlayerDead() {
        this.evt.fireEvent(GAME_OVER_EVENT);
    }

    getWorldCollisionBox() {
        return this.hitBox;
    }

    getLightCollisionBox() {
        return this.hitBox;
    }

    getWallsIntersections(segment, margin = 0) {
        const wallHits = this.blocks.map(block => {
            return {
                block: block,
                intersection: getIntersection(segment, block.getWorldCollisionBox(), margin)
            };
        }).filter(res => res.intersection);

        return this.#getInernalWallsIntersections(segment, wallHits);
    }

    getWallsLightIntersections(segment) {
        const wallHits = this.blocks.map(block => {
            return {
                block: block,
                intersection: getIntersection(segment, block.getLightCollisionBox())
            };
        }).filter(res => res.intersection);
        return this.#getInernalWallsIntersections(segment, wallHits);
    }

    #getInernalWallsIntersections(segment, wallHits) {
        const wallHitsWithDistance = wallHits.map(hit => {
            return {
                block: hit.block,
                x: hit.intersection.x,
                y: hit.intersection.y,
                distance: MATH.distance({ x: segment.startX, y: segment.startY }, hit.intersection),
            };
        }).sort((hitA, hitB) => Math.sign(hitA.distance - hitB.distance));

        return wallHitsWithDistance;
    }

    removeBlock(blockToRemove) {
        this.blocks = this.blocks.filter(block => block !== blockToRemove);
        this.onWallsChanged();
    }

    #buildExits(exitsDescription) {
        const exits = [];

        for (const exit of exitsDescription) {
            exits.push(new Exit(
                this,
                exit.x,
                exit.y,
                exit.width,
                exit.height,
                exit.nextMap,
                exit.nextExit
            ));
        }

        return exits;
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

        for (const door of blocksDescription.doors) {
            blocks.push(new Door(this, door.x, door.y, door.width, door.height, door.openState));
        }

        for (const box of blocksDescription.box) {
            blocks.push(new WoodenBox(this, box.x, box.y, box.width, box.height, box.onBreak));
        }

        for (const interactiveBlock of blocksDescription.interactiveBlocks) {
            blocks.push(new InteractiveBlock(
                this,
                interactiveBlock.x,
                interactiveBlock.y,
                interactiveBlock.width,
                interactiveBlock.height,
                interactiveBlock.label,
                interactiveBlock.onActive,
                interactiveBlock.isSolid,
            ));
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
            const node = new NavigationNode(x, y, 'cell_' + cell.id, cell);
            navigationGrid.set(index, node);

            for (const connection of cell.connections) {
                const x = connection.point[0];
                const y = connection.point[1];
                const index = x + '_' + y;
                const node = new NavigationNode(x, y, cell.id + '_' + connection.cell.id, null);
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

    dispose() {
        CollisionResolver.removeFromLayer(this, 'MAP');
        // this.player.dispose();
        this.sprite.dispose();
        this.exits.forEach(exit => exit.dispose());
        this.blocks.forEach(block => block.dispose());
        this.lights.forEach(light => light.dispose());
        this.fogEmiters.forEach(fogEmiter => fogEmiter.dispose());
        Stepper.stopListenStep(this.nextBonusStep, this, this.#addBonus);
        Stepper.stopListenStep(this.nextZombiStep, this, this.#addZombi);
        this.player.evt.removeEventListener(PLAYER_IS_DEAD_EVENT, this, this.onPlayerDead);
        this.evt.fireEvent(DISPOSE_EVENT);
        this.evt.dispose();
    }
}

let debugId = 0;

class NavigationNode {
    constructor(posX, posY, id, cell) {
        this.x = posX;
        this.y = posY;
        this.id = id;
        this.cell = cell;
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
        if (right === -85) {
            console.warn('CELL', this);
        }
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
            if (prevLeft < posX) {
                const child = new Cell(
                    prevLeft,
                    posX,
                    this.bottom,
                    this.top,
                    this.blocks,
                );
                child.buildVerticalChilds();
                this.childs.push(child);
            }
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
            if (prevBottom < posY) {
                this.childs.push(new Cell(
                    this.left,
                    this.right,
                    prevBottom,
                    posY,
                    this.blocks,
                ));
            }
            prevBottom = posY;
        }
    }

    #cleanBlocks(blocks) {
        return blocks.filter(block => {
            if (block.isSolid === false) return false;
            if (block.posX >= this.right) return false;
            if (block.posX + block.width <= this.left) return false;
            if (block.posY <= this.bottom) return false;
            if (block.posY - block.height >= this.top) return false;
            return true;
        });
    }
}