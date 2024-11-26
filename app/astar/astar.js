const LOOP_LIMIT = 100000;

class AStar {

	constructor() {
        this.graph = null;
        this.reset();
    }
    
    reset() {
        // this.evaluator = null;
        this.endWayPoint = null;
        this.open = [];
        this.close = [];
    }

    defaultSuccessCalback() {
        // do nothing
    }
    
    loadGraph(_graph) {
        this.graph = _graph;
    }
    
    setEvaluator(_evaluator) {
        this.reset();
        this.evaluator = _evaluator;
    }
    
    launch(_startNode, _endNode) {
        this.setup(_startNode, _endNode);
        for (let i = 0; i < LOOP_LIMIT; i ++) {
            const path = this.step();
            if (path !== null) {
                return path;
            }
        }
        console.warn('LOOP_LIMIT EXCEED');
        return [];
    }
    
    setup(_startNode, _endNode) {
        this.reset();
        this.endWayPoint = new WayPoint(_endNode);
        const startWayPoint = new WayPoint(_startNode);
        this.addToOpen(startWayPoint);
    }

    step() {
        const curWayPoint = this.getBestOpen();
        if (this.isFinalWayPoint(curWayPoint)) {
            const path = this.buildPath(curWayPoint);
            return path;
        }
        if (!curWayPoint) {
            console.log('NO OPEN WAYPOINTS');
            return [];
        }
        this.addToClose(curWayPoint);
        const siblings = this.getSiblings(curWayPoint);
        for (let i = 0; i < siblings.length; i ++) {
            const wayPoint = siblings[i];
            wayPoint.setParent(curWayPoint);
            const cost = this.evaluator.evaluate(wayPoint, this.endWayPoint);
            wayPoint.setCost(cost);
            this.addToOpen(wayPoint);
        }
        return null;
    }

    isFinalWayPoint(_wayPoint) {
        return _wayPoint.node == this.endWayPoint.node;
    }

    getSiblings(_wayPoint) {
        const res = [];
        const sibling = _wayPoint.node.getSiblings();
        for (let i = 0; i < sibling.length; i ++) {
            const waypoint = this.getAvailableWaypoint(sibling[i]);
            if (!waypoint) {
                continue;
            }
            waypoint.parent = _wayPoint;
            res.push(waypoint);
        }
        return res;
    }

    getAvailableWaypoint(_node) {
        if (this.listContainsNode(this.open, _node)) return null;
        if (this.listContainsNode(this.close, _node)) return null;
        return new WayPoint(_node);
    }

    listContainsNode(_list, _node) {
        const matching = _list.filter(wayPoint => {
            return wayPoint.node == _node;
        })
        return matching.length > 0;
    }

    addToOpen(_wayPoint) {
        this.open.push(_wayPoint);
        this.open = this.open.sort((a, b) => b.cost - a.cost);
    }
    
    addToClose(_wayPoint) {
        _wayPoint.isClosed = true;
        this.close.push(_wayPoint);
    }

    getBestOpen() {
        return this.open.pop();
    }

    buildPath(_wayPoint) {
        const path = [];
        while (_wayPoint) {
            path.push(_wayPoint);
            _wayPoint = _wayPoint.parent;
        }
        return path;
    }

}

class WayPoint {

    constructor(_node) {
        this.node = _node;
        this.parent = null;
        this.cost = 0;
        this.isClosed = false;
        this.distanceFromStart = 0;
    }

    setParent(_parent) {
        this.parent = _parent;
        this.distanceFromStart = this.parent.distanceFromStart + 1;
    }

    setCost(_cost) {
        this.cost = _cost;
    }
}


export {AStar as default};