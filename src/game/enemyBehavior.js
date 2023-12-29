import { AStar, relativePositions } from "../utils/AStar.js";
//import { Vec } from "../utils/vectorMath.js";
import { Vec } from "../utils/vectorMath.js";

export const VISIBILITY_RANGE = 120;
export const MELEE_ATTACK = 32;
export const RUN_RANGE = 200;
export const BYPASS_RANGE = 150;
export const MIN_BYPASS_SPEED = 0.3;
export const ATTACK_DELAY = 500;

export class EnemyController {

    engine;
    entity;
    attackDelay = false;

    constructor(engine, entity) {
        this.engine = engine;
        this.entity = entity;
        this.confused = true;
        this.pursue = false;
        this.astar = new AStar({x: this.entity.xy.x + this.entity.collision.x, 
            y: this.entity.xy.y + this.entity.collision.y,}, this.engine.player.xy, 
            this.engine.mapMng.obstacleMap, this.engine.world);
        this.idx = 0;
        this.pathPts = [];
        //this.astar.navigatePathToGoal();
    }

    descisionTree() {
        
        this.distance = this.getDistance(this.engine.player.xy)
        if (!this.entity.dead) {
            this.pathToGoal = this.astar.completePath;
            //if (this.entity.getHP() <= 0) {
                //this.entity.death();
                //this.engine.delete(this.entity);
                //return;
            //} //death behaviour

            if (this.getDistance(this.engine.player.xy) > VISIBILITY_RANGE) { //confused behaviour 
                //console.log('confused')
                this.confused = true;
                this.moveConfused();
                //return;
            } else {
                this.confused = false;
                if(this.distance > MELEE_ATTACK) {
                    //console.log('pursue')
                    this.pursue = true;
                    this.move();
                } else this.attack(this.engine.player)
            }
        }
    }

    moveConfused() {
        let rngNum = this.getRngInteger(15, this.engine.mapMng.tilesize * 2);
        let newXY = this.getRngDirection();
        this.pathPts = [];
        for (let i = 0; i < rngNum; i++) {
            this.pathPts.push(newXY);
            //this.entity.move(newXY, this.engine.pMng);
        }
        newXY = this.getRngDirection();
        for (let i = 0; i < rngNum; i++) {
            this.pathPts.push(newXY);
        }
    }

    move() {  
        let newXY = new Vec(0, 0)    
        this.pathPts = []; 
        //console.log(this.pathToGoal)
        for (let i = 1; i < this.pathToGoal.length; i++) {
            let a = this.pathToGoal[i - 1];
            let b = this.pathToGoal[i];
            let dx = (b.x - a.x)// * this.engine.world.tilesize;
            let dy = (b.y - a.y)// * this.engine.world.tilesize;
            let dist = Math.sqrt((dx*dx) + (dy*dy));
            for (let j = 0; j < this.engine.world.tilesize / this.entity.speed; j++) {
                newXY = new Vec(
                    dx * this.entity.speed,
                    dy * this.entity.speed
                )  
                this.pathPts.push(newXY);
            }
        }
    }

    inLineOfSight() {
        let targetXY = this.engine.player.xy;
        let entityXY = this.entity.xy;
        
    }

    checkInRange() {
        if (this.getDistance(this.engine.player.xy) <= VISIBILITY_RANGE) {
            this.entity.target = this.engine.player;
            return true;
        }
        return false;
    }
    
    attack(target) {
        if(!target.isDead())
            this.entity.attack(target);
        else this.moveConfused();
    }

    rotate(target) {
        if (!target) 
        this.rotation = Math.atan2(this.engine.player.xy.y - this.entity.xy, 
            this.engine.player.xy.x - this.entity.xx)
        else
        this.rotation = Math.atan2(target.xy.y - this.entity.xy, 
            target.xy.x - this.entity.xx)
    }

    getDistance(goal) {
        this.dx = goal.x - this.entity.xy.x;
        this.dy = goal.y - this.entity.xy.y;
        let distance = Math.sqrt((this.dx*this.dx) + (this.dy*this.dy));
        return distance
    }

    updateSpeed() {
        this.speedX = this.entity.speed;
        this.speedY = this.entity.speed;
    }

    getRngInteger(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    getRngDirection() {
        let directions = relativePositions;
        let keys = Object.keys(directions);
        return directions[keys[ keys.length * Math.random() << 0]];
        
    }
    
    update() {
        //this.astar.update({x:  this.entity.xy.x + this.entity.collision.x, 
            //y: this.entity.xy.y + (this.entity.xy.y - this.entity.collision.y),}, this.engine.player.xy)
        this.astar.update({x:  this.entity.xy.x + this.entity.collision.x, 
            y: this.entity.xy.y + this.entity.collision.y,}, this.engine.player.xy)
        this.pathToGoal = this.astar.completePath;
        this.idx = 0;
        this.pathPts = [];
        this.descisionTree(); 

    }
}



