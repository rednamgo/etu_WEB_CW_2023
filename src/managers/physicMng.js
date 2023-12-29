import { Vec } from "../utils/vectorMath.js";

export class physicManager {
    constructor(ctx, obstacles) {
        this.collisionMap = obstacles; 
        this.ctx = ctx;
    }

    setXYEntityData(entity) {
        let entityCollisionData = {
            x: entity.collision.x,
            y: entity.collision.y,
            xy: {x: entity.xy.x, y: entity.xy.y},
            height: entity.collision.height,
            width: entity.collision.width
        };

        return entityCollisionData
    }

    checkObstacleCollision(entity) { //true if entity collides with an obstacle
        let entityCollisionData = this.setXYEntityData(entity)

        for (let i = 0; i < this.collisionMap.length; i++) {
            if (this.detectCollision(entityCollisionData, this.collisionMap[i]) 
                || !this.inMap(entityCollisionData)) 
                return true
        }

        return false;
    }

    detectEntitiesCollision(a, b) {
        //console.log('detectEntitiesCollision ', a, b)
        //console.log(b.sprite.animations[b.sprite.currentAnimation])
        //let aAnimation = a.sprite.animations[a.sprite.currentAnimation].collision;
        let aTrueXY =  {x: Math.abs(a.xy.x), y: Math.abs(a.xy.y)} //this.getTrueCoordinates(a.sprite.animations[a.sprite.currentAnimation].collision);
        let bTrueXY = this.getTrueCoordinates(b.sprite.animations[b.sprite.currentAnimation].collision);
        //console.log(bTrueXY)
        let aCorners = {
            right: Math.floor(aTrueXY.x + a.collision.width),
            bottom: Math.floor(aTrueXY.y+ a.collision.height)
        };
        let bCorners = {
            right: Math.floor(bTrueXY.x),
            bottom: Math.floor(bTrueXY.y)
        };

        

        const overlapX = (aTrueXY.x <= bCorners.right && aCorners.right >= bTrueXY.x)  
        const overlapY = (aTrueXY.y <= bCorners.bottom && aCorners.bottom >= bTrueXY.y)

        return (overlapX && overlapY);
    }

    detectCollision(a, b) { //if true => collision is happening
        let aTrueXY = this.getTrueCoordinates(a);
        let bTrueXY = this.getTrueCoordinates(b);
        let aCorners = {
            right: Math.floor(aTrueXY.x + a.width),
            bottom: Math.floor(aTrueXY.y + a.height)
        };
        let bCorners = {
            right: Math.floor(bTrueXY.x + b.width),
            bottom: Math.floor(bTrueXY.y + b.height)
        };

        const overlapX = (aTrueXY.x <= bCorners.right && aCorners.right >= bTrueXY.x)  
        const overlapY = (aTrueXY.y <= bCorners.bottom && aCorners.bottom >= bTrueXY.y)
        return (overlapX && overlapY);
    }

    inMap(a) { //true if sprite collision in map bounds
        let aTrueXY = this.getTrueCoordinates(a);
        let aCorners = {
            right: Math.floor(aTrueXY.x + a.width),
            bottom: Math.floor(aTrueXY.y + a.height)
        };

        const inX = aCorners.right * 2 <= this.ctx.canvas.width && aTrueXY.x >= 0; //2 - default canv scale to tilemap
        const inY = aCorners.bottom * 2 <= this.ctx.canvas.height && aTrueXY.y >= 0;
        return (inX && inY)
    }

    getTrueCoordinates(a) { //get true coordinates of the collision layer of the sprites
        let aXY = {}
        if (a.xy) {
            aXY = {
                x: Math.floor(a.xy.x + a.x),
                y: Math.floor(a.xy.y + a.y),
            };
        } else {
            aXY = {
                x: Math.floor(a.x),
                y: Math.floor(a.y)
            }
        }
        
        return aXY;
    }   

    updateMapData(ctx, obstacles) {
        this.ctx = ctx;
        this.collisionMap = obstacles;
    } // use when changing maps
}