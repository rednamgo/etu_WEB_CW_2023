import { Vec } from '../utils/vectorMath.js'
import { imageLoader } from '../utils/imgLoader.js';

export class mapManager {
    constructor(maps, tilesets) {
        this.maps = maps;
        this.lvl = 1;
        this.data = {};
        this.ts = tilesets;
        this.currTs = null;
        this.loaded = false;
    }

    loadNextLvl(lvl) {
        this.data = this.maps[lvl - 1];
        this.currentTerrainCanvas = null;
        this.obstacleMap = null;
        this.tilesize = this.data.tilewidth;
        let width = this.tilesize * this.data.width;
        let height = this.tilesize * this.data.height;
        this.mapSize = new Vec(width, height);
        this.terrain = {}
        this.terrain.tiles = this.data.layers[0].data; 
        this.terrain.tileset = this.ts.find(t => t.name === 'TX Tileset Grass');
        this.layers = {}; //save layers of the map
        this.data.layers.map((l) => {
                this.layers[l.name] = l
        })
        this.processMapGeometry();
        this.terrain.tileset_size = {
            width: this.terrain.tileset.width / this.tilesize,
            height: this.terrain.tileset.height / this.tilesize + 1
        }
    }

    loadMapData(lvl) {
        this.data = this.maps[lvl - 1];
        this.currentTerrainCanvas = null;
        this.obstacleMap = null;
        this.tilesize = this.data.tilewidth;
        let width = this.tilesize * this.data.width;
        let height = this.tilesize * this.data.height;
        this.mapSize = new Vec(width, height);

        this.terrain = {}
        this.terrain.tiles = this.data.layers[0].data; //get map background data on tiles from TX Grass REWORK
        this.terrain.tileset = this.ts.find(t => t.name === 'TX Tileset Grass');

        this.layers = {}; //save layers of the map
        this.data.layers.map((l) => {
                this.layers[l.name] = l
        }) //then attach tilesets parameters to layers

        this.cacheTilesetImages(); //use to chache all tileset pngs
        this.processMapGeometry(); //turn tiles array to 2d for convenience

        this.terrain.tileset_size = {
            width: this.terrain.tileset.width / this.tilesize,
            height: this.terrain.tileset.height / this.tilesize + 1
        }
    }

    isLoaded() {
        if (this.terrain.tiles && this.currentTerrainCanvas && this.obstacleMap) {
            return true;
        }
        return false;
    }

    getTileSprite(col, row) {
        return this.terrain.tiles[col][row]
    }

    cacheTilesetImages() {
        let imgLoader = new imageLoader(this.terrain.tileset.image)
        let imgPaths = [];
        this.ts.map( t => imgPaths.push(t.image));
        this.tsImages = {};

        imgPaths.map((p) => {
            imgLoader.loadImage(p).then( () => {
                this.tsImages[p] = imgLoader.img;
                if (p === "assets\/Texture\/TX Tileset Grass.png") {
                    this.terrain.tileset.png = this.tsImages[p];
                }
            })
        }) //cache images of the tilesets
    }

    processMapGeometry() {
        let newMapData = [];
        while(this.terrain.tiles.length) newMapData.push(this.terrain.tiles.splice(0, 10));
        this.terrain.tiles = newMapData;
        //console.log(this.terrain.tiles)
    } //transform tiles into 2d array for convenience

    draw(ctx) { //render base layer

        for (let y = 0; y < this.data.height; y++) {
            for (let x = 0; x < this.data.width; x++) {


                let id = this.terrain.tiles[y][x] - 1;
                let positionX = x * this.tilesize;
                let positionY = y * this.tilesize;
                let sourceX = Math.floor(id % this.terrain.tileset.columns) * this.tilesize ;
                let sourceY = Math.floor(id / this.terrain.tileset.columns) * this.tilesize;

                let scale = 2;

                ctx.drawImage(
                    this.terrain.tileset.png,
                    sourceX,
                    sourceY,
                    this.tilesize,
                    this.tilesize,
                    positionX * scale, //2 to scale up
                    positionY * scale,
                    this.tilesize * scale,
                    this.tilesize * scale
                );
            }
        }

        this.renderLayer(ctx, this.layers['obstacles'])
        if (!this.currentTerrainCanvas)
            this.currentTerrainCanvas = ctx;
        //this.renderLayer(ctx, this.layers['items'])
    } 

    creareMapGeometry(layer) {
        let objArr = layer.objects;
        let t = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];

        let xy = new Vec (0, 0)

        for (let i = 0; i < objArr.length; i++) {
            xy.x = Math.floor(objArr[i].x / 32);
            xy.y = Math.floor(objArr[i].y / 32);
            t[xy.x][xy.y - 1] = objArr[i].gid;
        }

        //console.log(t)

        return t;
    }

    renderLayer(ctx, layer) { //render static layer

        layer.tiles = this.creareMapGeometry(layer); // create 2d XYmap of gid-s
        if (layer.name === 'obstacles') this.obstacleMap = layer.tiles;
        let tss = this.data.tilesets; //list of tilesets on curr map
        let currTs = '';

        for (let y = 0; y < this.data.height; y++) {
            for (let x = 0; x < this.data.width; x++) {

                let id = layer.tiles[x][y];

                //find which tileset has current XY tile by gid
                currTs = {}

                tss.map( t => {
                    if (id >= t.firstgid) {
                        currTs.source = t.source;
                        currTs.firstgid = t.firstgid;
                    }
                }) 

                if (!currTs.source) continue;

                currTs.ts = this.ts.find(t => t.name === currTs.source.slice(0, -4));
                
                let positionX = x * this.tilesize;
                let positionY = y * this.tilesize;
                let sourceX = Math.floor((id - currTs.firstgid) % currTs.ts.columns) * this.tilesize;
                let sourceY = Math.floor((id - currTs.firstgid) / currTs.ts.columns ) * this.tilesize;

                let scale = 2;
                
                ctx.drawImage(
                    this.tsImages[currTs.ts.image],
                    sourceX,
                    sourceY,
                    this.tilesize,
                    this.tilesize,
                    positionX * scale, //2 to scale up
                    positionY * scale,
                    (this.tilesize) * scale,
                    (this.tilesize) * scale
                );
            }
        }
    }
} //there seem to be artifacts due to scale - look into buffer canvas for solution


export async function parseMaps(filenames, setnames) {
    let maps = [];
    let tilesets = [];
    let tmp = {};

    for (let i = 0; i < filenames.length; i++) {
        tmp = await(await fetch(`./assets/${filenames[i]}`)).json()
        maps.push(tmp)
    }

    for (let i = 0; i < setnames.length; i++) {
        tmp =  await (await fetch(`./assets/${setnames[i]}`)).json() 
        tilesets.push(tmp)
    }
    

    return [maps, tilesets];
}



