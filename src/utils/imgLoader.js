export class imageLoader {

  constructor(name) {
    this.name = name;
    this.path = './assets/';
    this.img = null;
  }

  load(imageName) {
    return new Promise((resolve) => { 
        let i = new Image();
        i.src = `${this.path}${this.name}`;
        i.onload = (() => resolve(i));
    });
}

  async loadImage(name) {
    this.img = {};
    if (name !== this.name) this.name = name;
    this.img = await this.load();
  }
}