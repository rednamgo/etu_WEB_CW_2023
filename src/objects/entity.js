import { Vec } from "../utils/vectorMath.js";

export class Entity { //general parent-class for interactable game obj
    constructor(startPos, ctx, sMng, parameters) {
        this.xy = new Vec(startPos.x, startPos.y);
        this.ctx = ctx;
        this.collision = {}; //current collision params
        this.animations = {}; //set of sprite collisions dep on state
        this.tileset = {};
        this.sMng = sMng;

        this.type = parameters.type; //character|enemy|item
        this.params = parameters; // hp, atk, speed, name, state  
        this.range = 1;   
        this.dead = false; 
        this.params.maxHp = this.params.hp; //save max HP 
        if (this.type === 'item') this.setItemType();
    }

    setSprite(spriteData, imageCache) {
        this.tileset = spriteData;
        //if (this.params.type !== 'item') {
            this.setAnimationCollisions();
            this.params.state = 'idle';

            this.collision = {
                x: spriteData.tiles[0].objectgroup.objects[0].x,
                y: spriteData.tiles[0].objectgroup.objects[0].y,
                height: spriteData.tiles[0].objectgroup.objects[0].height,
                width: spriteData.tiles[0].objectgroup.objects[0].width,
            } //sprite collision data inside the tile

            this.sprite = new Sprite(this, spriteData, imageCache, this.animations);
            if (!this.item_type)
                this.sprite.setAnimation('idle');
            else this.sprite.setAnimation(this.item_type);
        //}
    }

    setItemType() {
        if (this.params.hp) this.item_type = 'heal';
        if (this.params.atk) this.item_type = 'power';
        if (this.params.bonus) {
            if (this.params.bonus === 500) this.item_type = 'bonus_2';
            else this.item_type = 'bonus_1';
        }
    }

    display() {
        if (this.isDead()) {
            this.sprite.playDeath();
        } else {
            this.sprite.animate(this.sprite.currentAnimation)
            this.sprite.display(this.ctx);
        }
        
    }

    move(newXY, physicMng) {
        this.params.state = 'idle';
        this.xy = this.xy.add(newXY);
        this.xy.x = Math.floor(this.xy.x)
        this.xy.y = Math.floor(this.xy.y)
        
        if (physicMng.checkObstacleCollision(this)) {
            this.xy = this.xy.diff(newXY);
        }
    }

    attack(target, atk) {
        //if (this.params.state === 'hurt') return; WIP IMPLEMENT STAGGER FUNC ???
        console.log(this.params.type, 'ATTACKS' , target.params.type)
        this.sMng.sounds.hit.play();
        target.recieveDmg(atk);
    }

    death() {
        this.params.state = 'death';
        if (this.type === 'player') this.sMng.sounds.death.play();
        else this.sMng.sounds.enemyDeath.play();
        this.dead = true;
    }

    recieveDmg(dmg) {
        this.params.state = 'hurt';
        console.log(this.params)
        this.sprite.setAnimation('hurt');
        this.params.hp -= dmg;
        if (this.params.hp < 0) this.death();
    }

    pickUpItem(item) { //if returns INT -> add to game score; else -> temp param UP
        this.sMng.sounds.pickup.play();
        if (item.params.hp) this.heal(item.params.hp)
        if (item.params.bonus) return item.params.bonus;
        if (item.params.atk) {
            this.params.stdAtk = this.params.atk;
            this.params.atk += item.params.atk;
            setTimeout(() => {
                this.params.atk = this.params.stdAtk;
            }, 3000)
        }
    }

    heal(hp) { //healign mechanics
        if (this.params.hp >= this.params.maxHp) return;
        if (this.params.hp + hp >= this.params.maxHp) this.params.hp = this.params.maxHp;
        else this.params.hp += hp;
    }

    setAnimationCollisions() {
        //console.log(this.type, this.tileset.tiles.length)
        let tmp = this.tileset.tiles;
        if (tmp) {
            for (let i = 0; i < tmp.length; i++) {
                this.animations[tmp[i].properties[0].value] = {
                    frames: tmp[i].animation.map((f) => f.tileid),
                    collision: {
                        x: tmp[i].objectgroup ? tmp[i].objectgroup.objects[0].x : 34,
                        y: tmp[i].objectgroup ? tmp[i].objectgroup.objects[0].y : 34,
                        xy: {x: this.xy.x, y: this.xy.y},
                        height: tmp[i].objectgroup ? tmp[i].objectgroup.objects[0].height : 34,
                        width: tmp[i].objectgroup ? tmp[i].objectgroup.objects[0].width : 34,
                    },
                    speed: 0.02 * tmp[i].animation.map((f) => f.tileid).length
                }
            }  
        }
    }

    isDead() {
        return this.dead;
    }

    getCurrentHP() {
        return this.params.hp;
    }

    getCurrentAtk() {
        return this.params.atk;
    }
}

export class Sprite {
    constructor(entity, spriteData, imageCache, animations) {
        this.name = '';
        this.entity = entity;
        this.tileSize = spriteData.tilewidth;
        this.height = spriteData.height;
        this.width = 32;
        this.image = spriteData.image;

        this.currentFrame = 0;
        this.tileset = spriteData;
        this.animations = animations;
        this.currentAnimation = '';
        this.tick = 0;
        this.speed = 0.1;
        this.setImage(imageCache)
        this.deadSprite = null;
    }

    setImage(imageCache) {
        this.image = imageCache;
    }

    setDeadSprite() {
        this.deadSprite = this.animations['death'].frames[this.animations['death'].frames.length - 1];
    }

    addAnimation(name, frames) {
        this.animations[name].frames = frames; //frames = array of tiles to shift through when animated
        this.currentAnimation = name;
    }

    setAnimation(name) {
        if (name)
            this.currentAnimation = name;
    }

    animate(animationName) {
        this.currentAnimation = animationName;

        if (this.tick < 1) {
            this.tick += this.animations[this.currentAnimation].speed;
        } else {
            this.tick = 0;
            if (this.currentFrame < this.animations[this.currentAnimation].frames.length - 1) {
                this.currentFrame += 1;
            } else {
                this.currentFrame = 0;
                if (!this.entity.item_type) this.currentAnimation = 'idle';
            }
        }
    }

    flipSpriteHorizontally(ctx) {

    }

    display(ctx) {
        //this.animate(this.currentAnimation)
        let sourceX = Math.floor(
            this.animations[this.currentAnimation].frames[this.currentFrame] 
                % this.tileset.columns) * this.tileset.tilewidth;
        let sourceY = Math.floor(
            this.animations[this.currentAnimation].frames[this.currentFrame] 
                / this.tileset.columns) * this.tileset.tileheight
        ctx.drawImage(
            this.image,
            sourceX,
            sourceY,
            this.tileset.tilewidth, //=tilesize
            this.tileset.tileheight,
            this.entity.xy.x * 2,
            this.entity.xy.y * 2,
            this.tileset.tilewidth * 2,
            this.tileset.tileheight * 2
        );
    }

    displaySprite(ctx) {
        let sourceX = Math.floor(
            this.deadSprite % this.tileset.columns) * this.tileset.tilewidth;
        let sourceY = Math.floor(
            this.deadSprite / this.tileset.columns) * this.tileset.tileheight
        ctx.drawImage(
            this.image,
            sourceX,
            sourceY,
            this.tileset.tilewidth, //=tilesize
            this.tileset.tileheight,
            this.entity.xy.x * 2,
            this.entity.xy.y * 2,
            this.tileset.tilewidth * 2,
            this.tileset.tileheight * 2
        );
    }

    playDeath() {
        this.setDeadSprite();
        if (this.currentFrame < this.animations['death'].frames.length - 1) {
            this.animate('death')
            this.display(this.entity.ctx)
        } 
        this.displaySprite(this.entity.ctx);
    }
}



