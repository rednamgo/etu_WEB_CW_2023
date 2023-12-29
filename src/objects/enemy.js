import { Entity } from "./entity.js";
import { EnemyController, VISIBILITY_RANGE } from "../game/enemyBehavior.js";
import { Vec } from "../utils/vectorMath.js";

export class Enemy extends Entity {
    constructor(startPos, ctx, sMng, parameters, pts) {
        super(startPos, ctx, sMng, parameters);
        this.drop = pts;
        this.target = null; //player if need pursue
        this.behavior = null;
        //this.dead = false;
        this.speed = 2;
        this.movementPath = new Vec(0, 0);
        this.animation = 'idle';
    }
    
    setTarget(target) {
        this.target = target;
    }
    
    setBehavior(engine) {
        this.behavior = new EnemyController(engine, this);
        this.target = engine.player;
    }

    death() {
        super.death();
    }

    move() {
        if (this.behavior.idx < this.behavior.pathPts.length){
            this.animation = 'run'
            super.move(this.behavior.pathPts[this.behavior.idx] ,this.behavior.engine.pMng)
            this.lastIdx = this.behavior.idx;
        } else {
            this.behavior.idx = this.lastIdx;
        }
        this.behavior.idx++;
    }

    attack(target) {
        this.animation = 'atk'
        super.attack(target, this.params.atk);
    }

    update() {
        this.behavior.update();
    }
}