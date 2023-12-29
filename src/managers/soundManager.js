
 const soundsPaths = {
    step: "step.wav",
    pickup: "PickUp.wav",
    hit: "Hit.wav",
    nextLvl: 'nextLvl.wav',
    enemyDeath: "enemyDeath.wav",
    death: "PlayerDeath.wav",
    win: "win.wav",
}
 
 export class soundManager {

    constructor() {
        this.path = '/assets/audio/';
        this.ctx = new AudioContext();
        this.sounds = {};
        this.bg = 'bg.wav'
    }
  
    /** @param {string} path */
    async load() {
      this.sounds = {
        step: new Sound(this.ctx, `${this.path}${soundsPaths.step}`),
        pickup: new Sound(this.ctx, `${this.path}${soundsPaths.pickup}`),
        hit: new Sound(this.ctx, `${this.path}${soundsPaths.hit}`),
        nextLvl: new Sound(this.ctx, `${this.path}${soundsPaths.nextLvl}`),
        enemyDeath: new Sound(this.ctx, `${this.path}${soundsPaths.enemyDeath}`),
        death: new Sound(this.ctx, `${this.path}${soundsPaths.death}`),
        win: new Sound(this.ctx, `${this.path}${soundsPaths.win}`),
      };
      await Promise.all(Object.values(this.sounds).map((s) => s.load(this.ctx)));
    }

    bgMusicStart() {
        this.bgMusic = document.createElement("audio");
        this.bgMusic.id = "bgMusic";
        this.bgMusic.src = `${this.path}${this.bg}`;
        this.bgMusic.volume = 0.3;
        this.bgMusic.loop = true;
        this.bgMusic.play();
    }

    bgMusicStop() {
        this.bgMusic.pause();
    }
 }

 class Sound {

    constructor(ctx, path) {
        this.path = path;
        this.ctx = ctx;
        this.audio = null;
    }

    async load() {
        this.audio = await this.ctx.decodeAudioData(
            await (await fetch(this.path)).arrayBuffer()
        );
    }
  
    async play(volume = 0.5) {
        return new Promise((resolve) => {
            let s = this.ctx.createBufferSource(),
                g = this.ctx.createGain();
            g.gain.value = volume;
            s.buffer = this.audio;
            s.connect(g).connect(this.ctx.destination);
            s.start();
            s.onended = function () {
                resolve();
            };
        });
    }
  }