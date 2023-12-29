import { mapManager, parseMaps } from "../managers/mapMng.js";
import { Entity } from "../objects/entity.js";
import { Enemy } from "../objects/enemy.js";
import { ctrlEvents, eventManager } from "../managers/eventMng.js";
import { Vec } from "../utils/vectorMath.js";
import { physicManager } from "../managers/physicMng.js";
import { soundManager } from "../managers/soundManager.js";

const ATTACK_DELAY = 400;
export let end = false;
export let points = 0;

export class Game {
    constructor(ctx, playername) {
        this.world = { //everything about state of maps (size, tiles, entities....)
            ctx: ctx,
        };
        this.playername = playername; //for tablerecord
        this.points = 0; //-/
        this.currentLvl = 1; //map number
        this.end = false; //game end indicator
        this.eventMng = new eventManager(this.world.ctx); //event manager
        this.lastTime = 0;
        this.gameTime = 0;
        this.lastAttack = 0;
        this.tick = 0;
        this.gameover = false;
    }

    init() {
        this.setWorldParameters()   
    }

    updateMovement() {
        let newXY = new Vec (
            (this.eventMng.state.moves.has(ctrlEvents.RIGHT) -
                this.eventMng.state.moves.has(ctrlEvents.LEFT)) * 2,
            (this.eventMng.state.moves.has(ctrlEvents.DOWN) -
                this.eventMng.state.moves.has(ctrlEvents.UP)) * 2,
        );
        this.player.move(newXY, this.pMng);
    
        this.enemies.forEach((e) => e.isDead() ? '' : e.move())

        if (this.eventMng.state.moves.has(ctrlEvents.SPACE) && this.gameTime > (this.lastAttack + ATTACK_DELAY)) {
            for (let i = 0; i < this.enemies.length; i++) {
                this.lastAttack = this.gameTime;
                if (this.enemies[i].isDead()) continue;
                if (this.enemies[i].behavior.getDistance(this.player.xy) <= this.mapMng.tilesize) {
                    this.player.attack(this.enemies[i], this.player.params.atk);
                }
                if (!this.player.isDead()) this.checkIfItemPickedUp();
            }
        }
        
        clearCanvas(this);

        this.updateStepSound();
        this.updatePosition();
        this.updateAnimation(newXY);
    }

    updatePosition() {
        this.player.display();
        this.enemies.forEach((e) => e.display())
        this.items.forEach((i) => !i.isDead() ? i.display() : '')
    }

    updateAnimation(newXY) {
        let animation;          

        if (newXY.x !== 0 || newXY.y !== 0)
            animation = 'run';
        
        if (this.eventMng.state.moves.has(ctrlEvents.SPACE)) 
            animation = 'atk';

        this.enemies.forEach((e) => !e.isDead() ? e.sprite.setAnimation(e.animation) : '')
        
        this.player.sprite.setAnimation(animation);
    }

    updateEnemies() {
        this.enemies.forEach((e, index) => {
            if (e.isDead()) { 
                this.points += this.currentLvl * 100;
            } else e.update()
        })
    }

    updateStepSound() {
        if (this.tick < 1) {
            this.tick += 0.04;
        } else {
            this.tick = 0;
            if (this.eventMng.state.moves.has(ctrlEvents.RIGHT) || 
            this.eventMng.state.moves.has(ctrlEvents.LEFT) ||
            this.eventMng.state.moves.has(ctrlEvents.DOWN) || this.eventMng.state.moves.has(ctrlEvents.UP)) {
                this.sndMng.sounds.step.play();
            }
        }
    }

    update(p) {
        this.gameTime = p;
        if (this.mapMng.isLoaded())
            this.checkGameProgress();

        if (p - this.lastTime > 1000) { //1 sec interval for enemy update (movement & atks)
            this.updateEnemies();
            this.lastTime += 1000;
        }

        if (!this.gameover)
            this.updateMovement(p);
    }


    allEnemiesDead() {
        let res = true;
        this.enemies.forEach((e) => !e.isDead() ? res = false : '')
        return res;
    }

    countEnemyPoints() {
        this.enemies.map(e => {
            if (e.isDead()) this.points += e.params.atk * 100;
        })
    }

    checkIfItemPickedUp() {
        let tmp = 0;
        for (let i = 0; i < this.items.length; i++) {
            if (this.pMng.detectEntitiesCollision(this.player, this.items[i]) && !this.items[i].isDead()) {
                tmp += this.player.pickUpItem(this.items[i])
                console.log('PLAYER picked up ', this.items[i]);
                this.items[i].death();
            }
        }
        if (tmp) this.points += tmp;
    }

    checkGameProgress() {
        if (this.player.isDead()) this.gameOver();
        if (this.allEnemiesDead()) { 
            if (this.currentLvl === 2)
                this.gameOver()
                //return true;
            else {
                this.handleNextLevel();
            }
        }
    } //check if NEXT LVL or GAME OVER

    handleNextLevel() {
        this.countEnemyPoints();
        this.currentLvl++;
        this.mapMng.loaded = false;
        this.mapMng.loadNextLvl(this.currentLvl);
        this.mapMng.draw(this.world.ctx);
        this.pMng = new physicManager(this.world.ctx, this.mapMng.layers['collision'].objects);
        this.enemies = [];
        this.items = [];
        this.player = [];
        if (this.mapMng.isLoaded()) {
            this.getEntities();
            this.setEntitiesOnMap();
        }
        
    } //set new lvl

    gameOver() { //WIP - HANDLE DEATH
        this.countEnemyPoints();
        this.sndMng.bgMusicStop();
        if (this.player.isDead()) { 
            console.log('LOSER') //defeat behavior
        } else console.log('WINNER') //else -> win behavior
        this.gameover = true;
    }

    async setWorldParameters() { //set default world parameters
        this.world.sizepx = new Vec(this.world.ctx.canvas.width, this.world.ctx.canvas.height);
        this.world.sizet = new Vec(10, 10);
        this.world.tilesetNames = ['item_icons.tsj', 'Cave Spider Spritesheet.tsj', 
        'character_tileset.tsj', 'TX Plants.tsj', 'TX Props.tsj', 
        'TX Tileset Grass.tsj', 'TX Wall.tsj', 'Undead_pumpking_Sprites.tsj'];
        this.world.mapNames = ['lvl1.tmj', 'lvl2.tmj'];
        [this.world.maps, this.world.tilesets] = 
            await parseMaps(this.world.mapNames, this.world.tilesetNames);
        this.world.tilesize = this.world.maps[0].tileheight || 32;

        this.mapMng = new mapManager(this.world.maps, this.world.tilesets);
        this.mapMng.loadMapData(this.currentLvl);

        this.sndMng = new soundManager();

        setTimeout(() => {
            this.imagesCache = this.mapMng.imageCache;
            this.pMng = new physicManager(this.world.ctx, this.mapMng.layers['collision'].objects);
            this.mapMng.draw(this.world.ctx);
            this.sndMng.load();
            this.sndMng.bgMusicStart();
            this.getEntities();
            this.setEntitiesOnMap();
        }, 100);
    }

    getEntities() { //get layerData of the interactable entities on the map
        this.entitiesLayersData = {
            character: this.mapMng.layers['character'], 
            enemies: this.mapMng.layers['enemies'],
            items: this.mapMng.layers['items']
        };
    }

    getEntitiesData(entity) { //pinpoint entity's starting data for new Entity()
        let dy = entity.height;
        let entityStartPosition = new Vec(entity.x, entity.y - dy);
        let params = {};

        for (let i = 0; i < entity.properties.length; i++) {
            if (entity.properties[i].name === 'hp') params.hp = entity.properties[i].value;
            if (entity.properties[i].name === 'atk') params.atk = entity.properties[i].value;
            if (entity.properties[i].name === 'status') params.state = entity.properties[i].value;
            if (entity.properties[i].name === 'bonus') params.bonus = entity.properties[i].value;
            if (entity.properties[i].name === 'type') params.type = entity.properties[i].value;
        }

        //console.log(params)
        return [entityStartPosition, params];
    }

    setEntitiesOnMap() { //create all Entities & set on the game map
        let [entityStartPosition, params] = this.getEntitiesData(this.entitiesLayersData.character.objects[0]);

        let tsChar = this.mapMng.ts.find(t => t.name === 'AnimationSheet_Character');
        this.player = new Entity(entityStartPosition, this.world.ctx, this.sndMng, params); //player enitity object
        this.player.setSprite(tsChar, this.mapMng.tsImages[tsChar.image])

        let enemiesSpritesheet = '';
        if (this.currentLvl === 1) {
            enemiesSpritesheet = 'Cave Spider Spritesheet'
        } else enemiesSpritesheet = 'Undead_pumpking_Sprites';
        tsChar = this.mapMng.ts.find(t => t.name === enemiesSpritesheet);

        this.enemies = [];
        for (let i = 0; i < this.entitiesLayersData.enemies.objects.length; i++) {
            [entityStartPosition, params] = this.getEntitiesData(this.entitiesLayersData.enemies.objects[i]);
            this.enemies.push(
                new Enemy(entityStartPosition, this.world.ctx, this.sndMng, params, 100*this.currentLvl));
            this.enemies[i].setSprite(tsChar, this.mapMng.tsImages[tsChar.image])
            this.enemies[i].setBehavior(this);
        }

        this.items = [];
        tsChar = this.mapMng.ts.find(t => t.name === 'item_icons');
        for (let i = 0; i < this.entitiesLayersData.items.objects.length; i++) {
            [entityStartPosition, params] = this.getEntitiesData(this.entitiesLayersData.items.objects[i]);
            this.items.push(new Entity(entityStartPosition, this.world.ctx, this.sndMng, params));
            this.items[i].setSprite(tsChar, this.mapMng.tsImages[tsChar.image])
        }
        console.log(this.items)
    }
}

export async function startGame(ctx) {
    console.log('startGame')
    let game = new Game(ctx, 'u');
    game.init();

    setTimeout(() => {
        //console.log(game.enemies[0])
        startLoop(game);
    }, 600)
}

function startLoop(game) { //start game loop
    let lastTime = 0;
    const start = performance.now();
    function loop(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        let progress = timestamp;

        game.update(progress); //if true - gameOver - WIP
        
        lastTime = timestamp;
        //if (!game.gameover)
            window.requestAnimationFrame(loop);
        //else {
            //points += game.points;
            //end = true;
        //} 
    }
    window.requestAnimationFrame(loop);
}

function clearCanvas(game) {
    game.world.ctx.clearRect(0, 0, game.world.sizepx, game.world.sizepx);
    if (game.mapMng.currentTerrainCanvas)
        game.mapMng.draw(game.mapMng.currentTerrainCanvas);
}