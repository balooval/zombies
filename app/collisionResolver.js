import * as AnimationControl from './animationControl.js';


class CollisionResolver {

    constructor() {
        this.layers = {};
        this.entitiesToCheck = new Map();
        AnimationControl.registerToUpdate(this);
    }

    addToLayer(entitie, layerName) {
        this.layers[layerName] = this.layers[layerName] ?? [];
        this.layers[layerName].push(entitie);
    }

    removeFromLayer(entitie, layerName) {
        this.layers[layerName] = this.layers[layerName].filter(object => object !== entitie);
    }

    forgotCollisionWithLayer(entitie, layerName) {
        const targetLayers = this.entitiesToCheck.get(entitie);
        if (!targetLayers) {
            return;
        }
        const newLayersList = targetLayers.filter(name => name !== layerName)
        if (newLayersList.length > 0) {
            this.entitiesToCheck.set(entitie, newLayersList);
        } else {
            this.entitiesToCheck.delete(entitie);
        }
    }

    checkCollisionWithLayer(entitie, layerName) {
        if (this.entitiesToCheck.has(entitie) === false) {
            this.entitiesToCheck.set(entitie, []);
        }
        this.entitiesToCheck.get(entitie).push(layerName);
    }

    checkCollisions() {
        for (const [entitie, layersNames] of this.entitiesToCheck) {
            for (const layerName of layersNames) {
                const collisions = this.entitieCollideWithLayer(entitie, layerName);
                if (collisions.length > 0) {
                    entitie.onCollide(collisions, layerName);
                }
            }
        }
    }

    entitieCollideWithLayer(entitie, layerName) {
        const layer = this.layers[layerName];
        if (layer === undefined) {
            return [];
        }
        
        const collisions = [];
        for (const layerEntitie of layer) {
            if (this.entitiesCollide(entitie, layerEntitie) === true) {
                collisions.push(layerEntitie);
            }
        }

        return collisions;
    }

    entitiesCollide(entitieA, entitieB) {
        const boxA = entitieA.getWorldCollisionBox();
        const boxB = entitieB.getWorldCollisionBox();

        if (boxA.left > boxB.right) return false;
        if (boxA.right < boxB.left) return false;
        if (boxA.top < boxB.bottom) return false;
        if (boxA.bottom > boxB.top) return false;
        return true;
    }

    update(step, time) {
		this.checkCollisions();
	}
}

const collisionResolver = new CollisionResolver();
export {collisionResolver as default};