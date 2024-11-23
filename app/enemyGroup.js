import {
	Wolf,
	WolfStateEnter,
	WolfStateExit,
	WolfStateFallLife1,
	WolfStateFallLife2,
	DISPOSE_EVENT,
	ON_GROUND_EVENT,
} from './wolf.js';
import {Vector2} from '../vendor/three.module.js';
import {
	ENEMIES_FALL_MAX_POSITION,
	ENEMIES_START_POSITION,
	ENEMIES_GOAL_POSITION,
	GROUND_POSITION,
} from './map/map.js';
import * as Stepper from './utils/stepper.js';

class EnemyGroup {

	constructor(map) {
		this.run = true;
		this.map = map;
		this.waveNumber = 0;
		this.stepsBeforeNextGroup = 120;
		this.nextGroupStep = 0;
		this.wolves = new Set();
		this.currentGroupProps = null
	}

	dispose() {
		this.run = false;
		Stepper.stopListenStep(this.nextGroupStep, this, this.createGroup);
	}

	waitForNextGroup() {
		if (this.run === false) {
			return;
		}
		this.nextGroupStep = Stepper.curStep + this.stepsBeforeNextGroup;
		Stepper.listenStep(this.nextGroupStep, this, this.createGroup);
	}

	createGroup(step) {
		this.wolves.clear();
		this.waveNumber ++;

		Stepper.stopListenStep(
			step,
			this,
			this.createGroup
		);

		this.currentGroupProps = this.getGroupValues();
		this.currentGroupProps.currentIndex = 0;
		
		for (let i = 0; i < this.currentGroupProps.stepsOffset.length; i ++) {
			Stepper.listenStep(
				Stepper.curStep + this.currentGroupProps.stepsOffset[i],
				this,
				this.addWolf
			);
		}
	}

	getNextWolfLife() {
		// return 2;
		const probabilityFor2Life = this.waveNumber / 20;
		if (Math.random() < probabilityFor2Life) {
			return 2;
		}
		return 1;
	}

	addWolf(step) {
		Stepper.stopListenStep(step, this, this.addWolf);
		const startPosition = new Vector2(ENEMIES_START_POSITION.x, ENEMIES_START_POSITION.y);
		const fallPosition = ENEMIES_START_POSITION.x + 50 + this.currentGroupProps.positionOffsets[this.currentGroupProps.currentIndex];
		const life = this.getNextWolfLife();

		const wolfStates = new Map();
		wolfStates.set('ENTER', new WolfStateEnter(startPosition, fallPosition));
		wolfStates.set('EXIT', new WolfStateExit(startPosition, ENEMIES_GOAL_POSITION));
		if (life === 1) {
			wolfStates.set('FALL', new WolfStateFallLife1(startPosition, GROUND_POSITION));
		} else {
			wolfStates.set('FALL', new WolfStateFallLife2(startPosition, GROUND_POSITION));
			wolfStates.set('FALL1', new WolfStateFallLife1(startPosition, GROUND_POSITION));
		}

		const wolf = new Wolf(wolfStates);
		wolf.evt.addEventListener(ON_GROUND_EVENT, this, this.onWolfGround);
		wolf.evt.addEventListener(DISPOSE_EVENT, this, this.onWolfDispose);
		this.wolves.add(wolf);
		this.currentGroupProps.currentIndex ++;
	}

	onWolfGround(wolf) {
		wolf.evt.removeEventListener(ON_GROUND_EVENT, this, this.onWolfGround);
		this.map.wolfTouchGround(wolf);
	}

	onWolfDispose(wolf) {
		wolf.evt.removeEventListener(ON_GROUND_EVENT, this, this.onWolfGround);
		wolf.evt.removeEventListener(DISPOSE_EVENT, this, this.onWolfDispose);
		this.wolves.delete(wolf);
		if (this.wolves.size === 0) {
			this.waitForNextGroup();
		}
	}

	getWolvesOnGround() {
		return [...this.wolves].filter(wolf => wolf.getState().id === 'EXIT');
	}

	getGroupValues() {
		/*
		return {
			name: 'Double colonnes',
			timeOffsets: [
				0,
				1000,
				1200,
				2200,
				3400,
			],

			stepsOffset: [
				1,
				60,
				80,
				140,
				220,
			],

			positionOffsets: [
				ENEMIES_FALL_MAX_POSITION -  20,
				ENEMIES_FALL_MAX_POSITION -  70,
				ENEMIES_FALL_MAX_POSITION -  20,
				ENEMIES_FALL_MAX_POSITION -  70,
				ENEMIES_FALL_MAX_POSITION -  70,
			],
		};
		*/
		
		const groups = [
			{
				name: 'Double colonnes',
				stepsOffset: [
					1,
					60,
					80,
					140,
					220,
				],
				positionOffsets: [
					ENEMIES_FALL_MAX_POSITION -  20,
					ENEMIES_FALL_MAX_POSITION -  70,
					ENEMIES_FALL_MAX_POSITION -  20,
					ENEMIES_FALL_MAX_POSITION -  70,
					ENEMIES_FALL_MAX_POSITION -  70,
				],
			},

			{
				name: 'Diagonale haut',
				stepsOffset: [
					1,
					20,
					40,
					60,
					80,
				],
				positionOffsets: [
					ENEMIES_FALL_MAX_POSITION -  60,
					ENEMIES_FALL_MAX_POSITION -  45,
					ENEMIES_FALL_MAX_POSITION -  30,
					ENEMIES_FALL_MAX_POSITION -  15,
					ENEMIES_FALL_MAX_POSITION -  0,
				],
			},

			{
				name: 'Diagonale bas',
					stepsOffset: [
						1,
						45,
						90,
						135,
						180,
					],
					positionOffsets: [
						ENEMIES_FALL_MAX_POSITION -  0,
						ENEMIES_FALL_MAX_POSITION -  15,
						ENEMIES_FALL_MAX_POSITION -  30,
						ENEMIES_FALL_MAX_POSITION -  45,
						ENEMIES_FALL_MAX_POSITION -  60,
					],
			},

			{
				name: 'Ligne droite',
				stepsOffset: [
					1,
					25,
					50,
					75,
					100,
				],
				positionOffsets: [
					ENEMIES_FALL_MAX_POSITION -  0,
					ENEMIES_FALL_MAX_POSITION -  20,
					ENEMIES_FALL_MAX_POSITION -  40,
					ENEMIES_FALL_MAX_POSITION -  60,
					ENEMIES_FALL_MAX_POSITION -  80,
				],
			},

			{
				name: 'Colonne milieu',
				stepsOffset: [
					1,
					45,
					90,
					135,
					180,
				],
				positionOffsets: [
					ENEMIES_FALL_MAX_POSITION -  40,
					ENEMIES_FALL_MAX_POSITION -  40,
					ENEMIES_FALL_MAX_POSITION -  40,
					ENEMIES_FALL_MAX_POSITION -  40,
					ENEMIES_FALL_MAX_POSITION -  40,
				],
			}
		];

		const randomIndex = Math.floor(Math.random() * groups.length);
		return groups[randomIndex];
	}
}

export {EnemyGroup as default};