import { Vec } from "../utils/vectorMath.js";

export const ctrlEvents = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3,
    SPACE: 4,
}

export function getKeyEvent(event) {
    return [
        ctrlEvents.UP,
        ctrlEvents.LEFT,
        ctrlEvents.DOWN,
        ctrlEvents.RIGHT,
        ctrlEvents.SPACE
    ][['w', 'a', 's', 'd', ' '].indexOf(event.key)];
}

export class inputState {
    mousePosition = new Vec();
    mouseClick = false;
    movement = false;
    moves = new Set()
}

export class eventManager {
    state = new inputState();
    constructor(ctx) {
        ctx.canvas.addEventListener('mousemove', (event) => {
            let rect = ctx.canvas.getBoundingClientRect(); //to detect mouse position
            this.state.mousePos = new Vec(
              event.clientX - rect.left,
              event.clientY - rect.top
            );
        });
        this.movement = false; //for smooth movement?
        ctx.canvas.addEventListener("mousedown", (ev) => {
            this.state.mouseClick = true;
            //console.log('click')
          });
        ctx.canvas.addEventListener("mouseup", (ev) => {
            this.state.mouseClick = false;
        });
        window.addEventListener("keydown", (ev) => {
            this.state.moves.add(getKeyEvent(ev));
            this.state.movement = true;
            //console.log('key down')
        });
        window.addEventListener("keyup", (ev) => {
            this.state.moves.delete(getKeyEvent(ev));
            this.state.movement = false;
            //console.log('key up')
        });
    }
}