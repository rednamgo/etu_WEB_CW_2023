//easier to use vectors, math implemented in class

export class Vec {
    x;
    y;

    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }

    static fromAngle(a) {
      return new Vec(Math.cos(a), Math.sin(a));
    }

    sign() {
      return new Vec(...this.flat().map(Math.sign));
    }

    abs() {
      return new Vec(...this.flat().map(Math.abs));
    }

    flat() {
      return [this.x, this.y];
    }

    neg() {
      return new Vec(-this.x, -this.y);
    }

    add(v) {
      return new Vec(this.x + v.x, this.y + v.y);
    }

    diff(v) {
      return this.add(v.neg());
    }
  
    mult(k) {
      return typeof k === "number"
        ? new Vec(this.x * k, this.y * k)
        : new Vec(this.x * k.x, this.y * k.y);
    }
  
    dot(v) {
      return this.x * v.x + this.y * v.y;
    }
  
    len2() {
      return this.x ** 2 + this.y ** 2;
    }
  
    len() {
      return this.len2() ** (1 / 2);
    }
  
    norm() {
      let len = this.len();
      return len !== 0 ? new Vec(this.x, this.y).mult(1 / len) : new Vec();
    }

    rot(v) {
      if (typeof v === "number") {
        return this.rot(Vec.fromAngle(v));
      } else {
        v = v.norm();
        return new Vec(this.x * v.x - this.y * v.y, this.x * v.y + this.y * v.x);
      }
    }
  
    proj(v) {
      return this.dot(v) / this.len();
    }

    vecProj(v) {
      return this.norm().mult(this.proj(v));
    }

    compare(v) {
      return new this.diff(v).sign();
    }
  
    range(v) {
      return this.diff(v).len();
    }
  }
  
  export const axisX = new Vec(1, 0);
  export const axisY = new Vec(0, 1);
  