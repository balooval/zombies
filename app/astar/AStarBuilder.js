import AStar from './astar.js';
import BasicEvaluator from './WayPointEvaluator.js';

class AStarBuilder {

    constructor() {
        this.reset();
    }
    
    reset() {
        this.graph = null;
        this.evaluator = new BasicEvaluator();
        return this;
    }

    build() {
        const resolver = new AStar();
        resolver.loadGraph(this.graph);
        resolver.setEvaluator(this.evaluator);
        return resolver;
    }

    withGraph(_graph) {
        this.graph = _graph;
        return this;
    }

    withEvaluator(_evaluator) {
        this.evaluator = _evaluator;
        return this;
    }
}

export {AStarBuilder as default};