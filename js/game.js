export const FACE_TYPES = {
  DEFAULT: "default",
  PRESSED: "pressed",
  SHOCKED: "shocked",
  GLASSES: "glasses",
  DEAD: "dead",
};

export const TILE_TYPES = {
  FLAG: "flag",
  MINE: "mine",
  MINE_CROSSED: "mine_crossed",
  MINE_RED: "mine_red",
  QMARK: "qmark",
  QMARK_PRESSED: "qmark_pressed",
  HIDDEN: "hidden",
  HIDDEN_PRESSED: "hidden_pressed",
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
};

const timeCountDigit1 = document.querySelector(".time-count .digit-1");
const timeCountDigit2 = document.querySelector(".time-count .digit-2");
const timeCountDigit3 = document.querySelector(".time-count .digit-3");

export function updateDigits(d1, d2, d3) {
  timeCountDigit1.dataset.digit = d1;
  timeCountDigit2.dataset.digit = d2;
  timeCountDigit3.dataset.digit = d3;
}

export const generateBoard = (boardSize, numOfMines) => {
  const board = [];
  const minePositions = generateMinePositions(boardSize, numOfMines);
  for (let y = 0; y < boardSize; y++) {
    const row = [];
    for (let x = 0; x < boardSize; x++) {
      const element = document.createElement("div");
      element.classList.add("tile");
      element.dataset.type = TILE_TYPES.HIDDEN;

      const tile = {
        element,
        x,
        y,
        mine: minePositions.some((el) => hasSamePosition(el, { x, y })),
        get type() {
          return this.element.dataset.type;
        },
        set type(value) {
          this.element.dataset.type = value;
        },
      };
      row.push(tile);
    }
    board.push(row);
  }

  return board;
};

export const markTile = (tile, updateMineCount, mineCount) => {
  if (tile.type === TILE_TYPES.OPENED || /\d/.test(tile.type)) return;

  if (tile.type === TILE_TYPES.HIDDEN) {
    if (mineCount === 0) return;
    tile.type = TILE_TYPES.FLAG;
    updateMineCount(-1);
  } else if (tile.type === TILE_TYPES.FLAG) {
    tile.type = TILE_TYPES.QMARK;
  } else if (
    tile.type === TILE_TYPES.QMARK ||
    tile.type === TILE_TYPES.QMARK_PRESSED
  ) {
    tile.type = TILE_TYPES.HIDDEN;
    updateMineCount(+1);
  }
};

export const revealTile = (board, tile) => {
  if (tile.type !== TILE_TYPES.HIDDEN) {
    return;
  }

  if (tile.mine) {
    tile.type = TILE_TYPES.MINE_RED;
    return;
  }

  tile.type = "";
  const adjacentTiles = nearbyTiles(board, tile);
  const mines = adjacentTiles.filter((el) => el.mine);
  if (mines.length === 0) {
    adjacentTiles.forEach(revealTile.bind(null, board));
  } else {
    tile.type = TILE_TYPES[mines.length];
  }
};

export const checkWin = (board) => {
  return board.every((row) => {
    return row.every((tile) => {
      return (
        tile.type === TILE_TYPES.FLAG ||
        tile.type === TILE_TYPES.QMARK ||
        /\d/.test(tile.type) ||
        tile.type === "" ||
        (tile.mine &&
          (tile.type === TILE_TYPES.HIDDEN ||
            tile.type === TILE_TYPES.FLAG ||
            tile.type === TILE_TYPES.QMARK))
      );
    });
  });
};

export const checkLose = (board) => {
  return board.some((row) => {
    return row.some((tile) => {
      return tile.type === TILE_TYPES.MINE_RED;
    });
  });
};

export const removeListenersFromGrid = (grid) => {
  grid.removeEventListener("click", stopProp, { capture: true });
  grid.removeEventListener("contextmenu", stopProp, { capture: true });
  grid.removeEventListener("mousedown", stopProp, { capture: true });
  grid.removeEventListener("mouseup", stopProp, { capture: true });
};

const addEventListenersToGrid = (grid) => {
  grid.addEventListener("click", stopProp, { capture: true });
  grid.addEventListener("contextmenu", stopProp, { capture: true });
  grid.addEventListener("mousedown", stopProp, { capture: true });
  grid.addEventListener("mouseup", stopProp, { capture: true });
};

export const checkGameEnd = (board, grid) => {
  const win = checkWin(board);
  const lose = checkLose(board);
  if (win || lose) {
    addEventListenersToGrid(grid);
  }
  if (win) {
    console.log("YOU WON");
  }

  if (lose) {
    board.forEach((row) => {
      row.forEach((tile) => {
        if (
          !tile.mine &&
          (tile.type === TILE_TYPES.FLAG || tile.type === TILE_TYPES.QMARK)
        ) {
          tile.type = TILE_TYPES.MINE_CROSSED;
          return;
        }
        if (tile.mine && tile.type !== TILE_TYPES.MINE_RED) {
          tile.type = TILE_TYPES.MINE;
        }
      });
    });
  }
  return { win, lose };
};

const stopProp = (e) => {
  e.stopImmediatePropagation();
  e.preventDefault();
};

const nearbyTiles = (board, tile) => {
  const tiles = [];
  for (let y = -1; y < 2; y++) {
    for (let x = -1; x < 2; x++) {
      const t = board[y + tile.y]?.[x + tile.x];
      if (t) tiles.push(t);
    }
  }
  return tiles;
};

const generateMinePositions = (boardSize, numOfMines) => {
  if (numOfMines > boardSize ** 2) return [];
  const array = [];
  while (array.length < numOfMines) {
    const pos = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
    if (!array.some((el) => hasSamePosition(el, pos))) array.push(pos);
  }

  return array;
};

const hasSamePosition = (a, b) => {
  return a.x === b.x && a.y === b.y;
};

export const cleanTilesAfterMouseDown = (board) => {
  board.forEach((row) => {
    row.forEach((tile) => {
      if (tile.type === TILE_TYPES.QMARK_PRESSED) {
        tile.type = TILE_TYPES.QMARK;
      }
      if (tile.type === TILE_TYPES.HIDDEN_PRESSED) {
        tile.type = TILE_TYPES.HIDDEN;
      }
    });
  });
};

export const checkFirstMove = (board, tile, isFirstMove, board_size) => {
  if (isFirstMove && tile.mine) {
    for (let i = 0; i < board_size; i++) {
      let emptySlot = false;
      for (let j = 0; j < board_size; j++) {
        if (!board[i][j].mine) {
          emptySlot = j;
          break;
        }
      }

      if (emptySlot !== false) {
        board[i][emptySlot].mine = true;
        break;
      }
    }
    tile.mine = false;
  }
};
