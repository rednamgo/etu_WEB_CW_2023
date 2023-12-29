# etu_WEB_CW_2023
Course work for the Web-technologies class in ETU uni. 

## Notice
_This code is for study purposes only._ It is a half-baked 2D-game-monster-of-Frankenstein made in the panic right before the deadline so it could use **a lot** of code improvements and needs some serious refactoring. But, **it works**.

## Tasks
1. Written in "pure" JS ES6 (debatable)
2. Two game levels minimum
3. All managers from the "textbook" must be included
4. Scores Table (nope)
5. Obstacles
6. "Intellectual" enemies and "bonuses"
7. Use Tiled Map Editor

**DONE: 6/7**

## Game process
![Gameplay](https://github.com/rednamgo/etu_WEB_CW_2023/assets/26042700/44e36af5-a5fb-42e3-b801-086e71110234)

## In detail
Game is implemented using recursive loop. Overall, the general idea of the game is such - kill as many as you can and pickup bonus items. The more the better. Currently, only close-range "battle" is implemented. 

### Managers
Implemented managers are used to control certain technical logic in the game such as controls, sounds, etc. 
1. Event Manager - allows to track cursor movements inside the <canvas> and keys being pressed for movement/attack.
2. Map Manager - is used to get the asset data from the .tmj files and store it in layers to draw them one by one (Terrain, Obstacles, Enemies and Items).
3. Physics Manager - controls collisions between sprites and needed methods for the correct collision behavior.
4. Sound Manager - stores the sounds used in the game and contains methods to play them on demand.

### Objects
Player, Items and Enemies are considered Entities and only Enemies have their own subclass due to their unique behavior mechanins. Items either heal, power up or give bonus points. Enemies are able to "see" Player in a certain radius even through the obstacles and based on the Player position Enemies use their _descisionTree()) from the _enemyBehavior.js_  to either _moveConfused()_ or pursue and attack accordingly. For the pathfinding _A* algorithm_ is used.

Entity class also has a supplementary class Sprite which stores sprite data of the Entities and their animations. It is used to change image according to the actions of the Entity and displayes it. Currently only animated in Tiled Map Editor sprites are displayed correctly. 

### Game class
Initializes the variables and keeps game itself running with _update_ methods. 
```js
Game.update(p) { // method of the Game class
    this.gameTime = p;
    if (this.mapMng.isLoaded())
        this.checkGameProgress();

    if (p - this.lastTime > 1000) { // 1 sec interval for enemy update (movement & atks)
        this.updateEnemies();
        this.lastTime += 1000;
    }

    if (!this.gameover)
        this.updateMovement(p);
}

export async function startGame(ctx) {
    console.log('startGame')
    let game = new Game(ctx, 'u');
    game.init();

    setTimeout(() => {
        startLoop(game);
    }, 600)
}

function startLoop(game) { // start game loop
    let lastTime = 0;
    const start = performance.now();
    function loop(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        let progress = timestamp;

        game.update(progress); 
        
        lastTime = timestamp;
        window.requestAnimationFrame(loop); // use condition with game.gameover var to end the loop
    }
    window.requestAnimationFrame(loop);
}
```

## Things to improve
1. Implement correct Game Over logic
2. Game Stats bar in the separate(?) canvas on the left
3. Score Table at the end of the game
4. Diffirentate Enemy behavior depending on the Enemy type
5. _There is a bug when you open the game again after loosing - Player is dying in one hit_
6. _There is some sprite display bug, seems to be a scaling issue - there are lines along the borders sometimes_
7. Use game time as multiplicator for the final score to inspire more competitive behavior
8. Flip the Entity sprite when it movemend direction along the X axis changes (flipped sprites included in the assets folder already)
9. Generally improve async behavior

## Sources and useful materials
- General:
  - [Tiled Map Editor](www.mapeditor.org)
  - [game Copycat](https://codepen.io/Gthibaud/pen/ryQRYP?editors=0110)
  - [Tile based game development in Javascript & Canvas](https://youtu.be/txUvD5_ROIU?si=bAnurhx1GfrNXj9i)
  - [Tile Animation For HTML5 Games In Pure JS](https://youtu.be/AQABpi9nLfU?si=7SfrxdYYWTl4P_Pv)
  - [Sprite Animation in JavaScript](https://youtu.be/CY0HE277IBM?si=DWfCm3sWQoaN3jJ6)
- AI & Pathfinding:
  - [Square Seeker](https://codepen.io/gregweston/pen/NpjQwR)
  - [Implementation of A*](https://www.redblobgames.com/pathfinding/a-star/implementation.html#python-astar) 
  - [Implementing a State Design Pattern for an A.I. System](https://www.haroldserrano.com/blog/category/Design+Patterns)
- Assets
  - [Pixel Art Top Down - Basic](https://cainos.itch.io/pixel-art-top-down-basic)
  - [Hooded Protagonist](https://penzilla.itch.io/hooded-protagonist) 
  - [Cave Spider](https://aimmaga.itch.io/cave-spider)
  - [Undead Pumpking](https://pixxilandartstudio.itch.io/2d-pixel-art-undead-pumpking-sprites)
  - [Shikashi's Fantasy Icons Pack](https://shikashipx.itch.io/shikashis-fantasy-icons-pack)
  - [Free SFX](https://kronbits.itch.io/freesfx)
