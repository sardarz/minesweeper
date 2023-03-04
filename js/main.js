import {
  FACE_TYPES,
  TILE_TYPES,
  generateBoard,
  markTile,
  revealTile,
  checkGameEnd,
  removeListenersFromGrid,
  cleanTilesAfterMouseDown,
  checkFirstMove,
  updateDigits,
} from "./game.js";

const face = document.querySelector(".face");
const mineCountDigit1 = document.querySelector(".mine-count .digit-1");
const mineCountDigit2 = document.querySelector(".mine-count .digit-2");
const mineCountDigit3 = document.querySelector(".mine-count .digit-3");

const MINE_COUNT = 40;
let mineCount = MINE_COUNT;
let intervalID;
const board_size = 16;
let isFirstMove = true;

function startTimer() {
  let num = 1;
  intervalID = clearInterval(intervalID);
  updateDigits("0", "0", "0");
  intervalID = setInterval(() => {
    let str = num.toString().padStart(3, "0");
    updateDigits(str[0], str[1], str[2]);
    num++;
  }, 1000);
}

function stopTimer(resetDigits) {
  if (resetDigits) {
    updateDigits("0", "0", "0");
  }
  intervalID = clearInterval(intervalID);
}

function updateMineCount(num) {
  mineCount += num;
  if (mineCount < 0) mineCount = 0;
  let str = mineCount.toString().padStart(3, "0");
  mineCountDigit1.dataset.digit = str[0];
  mineCountDigit2.dataset.digit = str[1];
  mineCountDigit3.dataset.digit = str[2];
}

updateMineCount(0);

let board;
let grid = document.querySelector(".grid");
grid.style.setProperty("--board-size", board_size);

const startGame = () => {
  resetGame();
  board.forEach((row) => {
    row.forEach((tile) => {
      grid.append(tile.element);
      tile.element.addEventListener("click", (e) => onTileClick(e, tile));
      tile.element.addEventListener("contextmenu", (e) =>
        onTileContextMenu(e, tile)
      );
      tile.element.addEventListener("mousedown", (e) =>
        onTileMouseDown(e, tile)
      );
      tile.element.addEventListener("mouseup", (e) => onTileMouseUp(e, tile));
    });
  });
};

const resetGame = () => {
  mineCount = MINE_COUNT;
  updateMineCount(0);
  face.dataset.face = FACE_TYPES.DEFAULT;
  grid.innerHTML = "";
  removeListenersFromGrid(grid);
  board = generateBoard(board_size, mineCount);
  isFirstMove = true;
};

const updateFace = (win, lose) => {
  let faceType = FACE_TYPES.DEFAULT;
  if (win) {
    faceType = FACE_TYPES.GLASSES;
    stopTimer(false);
  }
  if (lose) {
    faceType = FACE_TYPES.DEAD;
    stopTimer(false);
  }
  face.dataset.face = faceType;
};

const onTileClick = (e, tile) => {
  e.preventDefault();
  if (!intervalID) startTimer();
  checkFirstMove(board, tile, isFirstMove, board_size);
  isFirstMove = false;
  revealTile(board, tile);
  const { win, lose } = checkGameEnd(board, grid);
  updateFace(win, lose);
};

const onTileContextMenu = (e, tile) => {
  e.preventDefault();
  markTile(tile, updateMineCount, mineCount);
};

const onTileMouseDown = (e, tile) => {
  e.preventDefault();
  if (e.button === 2 && tile.type === TILE_TYPES.QMARK) {
    tile.type = TILE_TYPES.QMARK_PRESSED;
  }
  if (e.button === 0 && tile.type === TILE_TYPES.HIDDEN) {
    tile.type = TILE_TYPES.HIDDEN_PRESSED;
    face.dataset.face = FACE_TYPES.SHOCKED;
  }
};

const onTileMouseUp = (e, tile) => {
  if (e.button === 2 && tile.type === TILE_TYPES.QMARK) {
    tile.type = TILE_TYPES.QMARK_PRESSED;
  }
  face.dataset.face = FACE_TYPES.DEFAULT;
};

grid.addEventListener("mouseup", () => {
  cleanTilesAfterMouseDown(board);
});

grid.addEventListener("mouseout", () => {
  cleanTilesAfterMouseDown(board);
});

face.addEventListener("click", () => {
  startGame();
  stopTimer(true);
});

face.addEventListener("mousedown", () => {
  face.dataset.face = FACE_TYPES.PRESSED;
});

startGame();
