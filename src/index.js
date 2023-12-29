import { appear, disappear, hide, show, renderRecords, saveRecord,} from "./utils/domUtils.js";
import { startGame, end } from "./game/game.js";

const ANIMATION_DELAY = 300;

const login = document.getElementById("loginScreen"),
    records = document.getElementById("recordTable"),
    canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d");

[login, canvas, records].map((e) => {
    disappear(e);
    hide(e);
});

let username = "";

let refreshInterval = setInterval(checkGameOver(), 3000);
  
function checkGameOver() {
    if (end) showRecords();
}

function showRecords() {
    saveRecord(username, points);
    clearInterval(refreshInterval);
    hide(canvas);
    disappear(canvas);
    show(records);
    appear(records);
    renderRecords(records);
}


(async function () {
    /*await SoundManager.load(`${assets}/sounds`);
    const ts = new TileSet(assets, "tileset.tsj");
    await ts.load();*/
  
    show(login);
    appear(login);
    show(document.body);
    login.querySelector("button").addEventListener("click", (ev) => {
      username = login.querySelector("input").value;
      disappear(login);
      setTimeout(() => {
        hide(login);
        show(canvas);
        appear(canvas);
        startGame(ctx);
      }, ANIMATION_DELAY);
    });

  })();
