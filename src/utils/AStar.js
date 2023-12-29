import { Vec } from "./vectorMath.js"

export const relativePositions = {
	top: new Vec(0, -1),
	topRight: new Vec(1, -1),
	right: new Vec(1, 0),
	bottomRight: new Vec(1, 1),
	bottom:new Vec(0, 1),
	bottomLeft: new Vec(-1, 1),
	left: new Vec(-1, 0),
	topLeft: new Vec(-1, -1)
};

export class AStar {

    constructor(startXY, finXY, obstacleMap, world) {
        this.startXY = startXY; //true XY of the entity
        this.finXY = finXY; //true XY of the goal
        this.obstacleMap = obstacleMap;


        this.tilesize = world.tilesize;
        this.rows = obstacleMap.length;
        this.cols = obstacleMap[0].length;

        this.openList = [];
        this.closedList = [];
        this.startNode = this.transformToTileXY(this.startXY); //transform free XY to XY of the tile in tiled map
        this.targetNode = this.transformToTileXY(this.finXY);
        this.obstacleLoc = [];
        this.completePath = [];
        this.startPositionFound = false;
        this.readObstacleLocations();
    }

    update(start, goal) {
        this.setStartXY(start);
        this.setGoalXY(goal);
        this.openList = [];
        this.closedList = [];
        
        //this.startPositionFound = false;
        
        this.navigatePathToGoal();
        //console.log(this.targetNode, this.startNode, this.completePath);
        //console.log('obstacles: ', this.obstacleLoc)
    }

    setStartXY(newXY) {
        this.startXY = newXY;
        this.startNode = this.transformToTileXY(this.startXY);
        if (this.obstacleMap[this.startNode.x][this.startNode.y]) {
            if (newXY.x < this.startNode.x * this.tilesize) this.startNode.x -= 1; //due to existing obstacles with collision < tilesize
            if (newXY.x > this.startNode.x * this.tilesize) this.startNode.x += 1;
        }
    }

    setGoalXY(newGoal) {
        
        this.finXY = newGoal;
        this.targetNode = this.transformToTileXY(this.finXY);
        if (this.obstacleMap[this.targetNode.x][this.targetNode.y]) {
            if (Math.abs(Math.floor(newGoal.x)) < this.targetNode.x * this.tilesize) this.targetNode.x -= 1;
            if (Math.abs(Math.floor(newGoal.x)) > this.targetNode.x * this.tilesize) this.targetNode.x += 1;
        }
    }

    setObstacleMap(newObstacleMap) {
        this.obstacleMap = newObstacleMap;
    }

    transformToTileXY(xy) {
        let x = Math.abs(Math.round(xy.x / this.tilesize))
        let y = Math.abs(Math.round(xy.y / this.tilesize))
        return new Vec(x, y)
    }

    readObstacleLocations() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.obstacleMap[i][j]) this.obstacleLoc.push(new Vec(i, j));
            }
        }
    }

    tileHasPathfinder(x, y) {
        return this.startNode.x === x && this.startNode.y === y;
    }
    
    tileHasGoal(x, y) {
        return this.targetNode.x === x && this.targetNode.y === y;
    }
    
    tileHasObstacle(x, y) {
        for (let i = 0; i < this.obstacleLoc.length; i++) {
            if (this.obstacleLoc[i].x === x && this.obstacleLoc[i].y === y) {
                return true;
            }
        }
        return false;
    }

    tileIsOccupied(x, y) {
        return this.tileHasObstacle(x, y) || this.tileHasGoal(x, y) || this.tileHasPathfinder(x, y);
    }

    getUsableAdjacentTiles(x, y) {
        let adjacentTiles = [];
        let adjacentTileCoords;
        for (let position in relativePositions) {
            adjacentTileCoords = {
                x: x + relativePositions[position].x,
                y: y + relativePositions[position].y
            };
            if (adjacentTileCoords.x >= 0 && adjacentTileCoords.x < this.cols
            && adjacentTileCoords.y >= 0 && adjacentTileCoords.y < this.rows
            && !this.tileHasObstacle(adjacentTileCoords.x, adjacentTileCoords.y)
            && this.tileIndexOnClosedList(adjacentTileCoords.x, adjacentTileCoords.y) === null) {
                adjacentTiles.push(adjacentTileCoords);
            }
        }
        return adjacentTiles;
    }

    getMovementCost(startX, startY, endX, endY) {
        let xCoordinateDifference = Math.abs(startX - endX);
        let yCoordinateDifference = Math.abs(startY - endY);
        if (xCoordinateDifference === 0) {
            return yCoordinateDifference;
        }
        if (yCoordinateDifference === 0) {
            return xCoordinateDifference;
        }
        if (xCoordinateDifference === yCoordinateDifference) {
            return xCoordinateDifference * 1.5;
        }
        if (xCoordinateDifference > yCoordinateDifference) {
            return (yCoordinateDifference * 1.5) + (xCoordinateDifference - yCoordinateDifference);
        }
        if (yCoordinateDifference > xCoordinateDifference) {
            return (xCoordinateDifference * 1.5) + (yCoordinateDifference - xCoordinateDifference);
        }
    }

    getTileGScore(parentX, parentY, newX, newY) {
        return this.getMovementCost(parentX, parentY, newX, newY);
    }

    getTileHScore(x, y) {
        return this.getMovementCost(x, y, this.targetNode.x, this.targetNode.y);
    }

    removeTileFromOpenList(x, y) {
        let index = this.tileIndexOnOpenList(x, y);
        this.openList.splice(index, 1);
    }

    tileIndexOnList(list, x, y) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].x == x && list[i].y == y) {
                return i;
            }
        }
        return null;
    }

    tileIndexOnOpenList(x, y) {
        return this.tileIndexOnList(this.openList, x, y);
    }

    tileIndexOnClosedList(x, y) {
        return this.tileIndexOnList(this.closedList, x, y);
    }

    addTileToClosedList(x, y, parentX, parentY) {
        if (this.tileIndexOnOpenList(x, y) !== null) {
            this.removeTileFromOpenList(x, y);
        }
        this.closedList.push({
            x: x,
            y: y,
            parent: {
                x: parentX,
                y: parentY
            }
        });
    }

    addTileToOpenList(x, y, parentX, parentY, gScore, fScore) {
        this.openList.push({
            x: x,
            y: y,
            fScore: fScore,
            gScore: gScore,
            parent: {
                x: parentX,
                y: parentY
            }
        });
    }

    openListIsEmpty() {
        return this.openList.length === 0;
    }

    tileOnOpenListWithLowestFScore() {
        let lowestFScore;
        let lowestFScoreIndex;
        for (let i = 0; i < this.openList.length; i++) {
            if (typeof lowestFScore === "undefined" || this.openList[i].fScore < lowestFScore) {
                lowestFScore = this.openList[i].fScore;
                lowestFScoreIndex = i;
            }
        }
        return this.openList[lowestFScoreIndex];
    }

    traceCompletePath() {
        this.startPositionFound = false;
        this.completePath = [];
        let nextParent;
        let goalPositionIndex = this.tileIndexOnClosedList(this.targetNode.x, this.targetNode.y);

        let currentTile;
        let nextTileIndex;
    
        if (goalPositionIndex === null) {
            return null;
        }
        currentTile = this.closedList[goalPositionIndex];
        //this.pathContext.beginPath();
        do {
            this.completePath.unshift({
                x: currentTile.x,
                y: currentTile.y
            });
            if (currentTile.x === this.startNode.x && currentTile.y === this.startNode.y) {
                this.startPositionFound = true;
                //this.pathContext.closePath();
                //this.pathContext.stroke();
                break;
            }
            nextTileIndex = this.tileIndexOnClosedList(currentTile.parent.x, currentTile.parent.y);
            if (nextTileIndex === null) {
                return null;
            }
            currentTile = this.closedList[nextTileIndex];
        } while (this.startPositionFound === false)
    }

    navigatePathToGoal() {
        this.openList = [];
        this.closedList = [];
        let pathComplete = false;
        let adjacentTiles;
        let startingTileFScore = this.getTileHScore(this.startNode.x, this.startNode.y);
        let currentTile;
        this.addTileToOpenList(this.startNode.x, this.startNode.y, null, null, 0, startingTileFScore);
        do {
            currentTile = this.tileOnOpenListWithLowestFScore();
            adjacentTiles = this.getUsableAdjacentTiles(currentTile.x, currentTile.y);
            adjacentTiles.forEach(function(tile, index) {
                let gScore = currentTile.gScore + this.getTileGScore(currentTile.x, currentTile.y, tile.x, tile.y);
                let hScore = this.getTileHScore(tile.x, tile.y);
                let fScore = gScore + hScore;
                let openListIndex = this.tileIndexOnOpenList(tile.x, tile.y);
                let tileAlreadyOnOpenList;
                if (openListIndex !== null) {
                    tileAlreadyOnOpenList = this.openList[openListIndex];
                    if (tileAlreadyOnOpenList.fScore > fScore) {
                        this.openList[openListIndex].fScore = fScore;
                        this.openList[openListIndex].parent.x = currentTile.x;
                        this.openList[openListIndex].parent.y = currentTile.y;
                    }
                } else {
                    this.addTileToOpenList(tile.x, tile.y, currentTile.x, currentTile.y, gScore, fScore);
                }}, this);
            this.addTileToClosedList(currentTile.x, currentTile.y, currentTile.parent.x, currentTile.parent.y);
            if (this.tileIndexOnClosedList(this.targetNode.x, this.targetNode.y) !== null) {
                this.traceCompletePath();
                return;
            }
        } while (!this.openListIsEmpty())

        
    } 
}





