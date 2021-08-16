class Board {
  constructor() {
    this.board = document.querySelector(".board");
  }

  // Add 200 divs in the board grid
  createBoard() {
    for (let i = 0; i < 200; i++) {
      const div = document.createElement("div");
      div.classList.add("board__square");
      this.board.appendChild(div);
    }

    //Add all squares in board to an array so each one have an index number
    this.squares = document.querySelectorAll(".board div");
  }

  drawBlock() {
    const currentSquares = this.block.getCurrentSquares();
    currentSquares.forEach((square) =>
      this.squares[square].classList.add("block")
    );
    this.lastPositions = currentSquares;
  }

  undrawBlock() {
    const currentSquares = this.lastPositions || [];
    currentSquares.forEach((square) =>
      this.squares[square].classList.remove("block")
    );
  }

  generateBlock() {
    if (!this.block) this.block = new Block(BLOCK_TYPE.Z);
  }

  init() {
    // don't forget to clear timer in the end of the game
    this.timer = setInterval(() => {
      this.generateBlock();
      this.undrawBlock();
      this.drawBlock();
      this.block.setPosition(10);
    }, 1000);
  }
}

const BLOCK_TYPE = {
  L: "L",
  T: "T",
  O: "O",
  S: "S",
  Z: "Z",
  I: "I",
};

// amount of squares in each row
const BOARD_WIDTH = 10;

class Block {
  //initialize a new block with a given blockType
  constructor(blockType) {
    this.blockType = blockType;
    this.position = 4; // initial position when block enters the board (middle top of the board)
    this.orientation = 0; // first array of positions of this.orientation. When block enters the board will always be in the first orientation (index=0)

    switch (this.blockType) {
      case BLOCK_TYPE.L:
        this.orientationsArray = [
          [1, 2, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1],
          [BOARD_WIDTH, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH + 2],
          [1, BOARD_WIDTH + 1, 2 * BOARD_WIDTH, 2 * BOARD_WIDTH + 1],
          [
            BOARD_WIDTH,
            2 * BOARD_WIDTH,
            2 * BOARD_WIDTH + 1,
            2 * BOARD_WIDTH + 2,
          ],
        ];
        break;
      case BLOCK_TYPE.T:
        this.orientationsArray = [
          [1, BOARD_WIDTH, BOARD_WIDTH + 1, BOARD_WIDTH + 2],
          [1, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH + 1],
          [BOARD_WIDTH, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH + 1],
          [1, BOARD_WIDTH, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1],
        ];
        break;
      case BLOCK_TYPE.O:
        this.orientationsArray = [
          [0, 1, BOARD_WIDTH, BOARD_WIDTH + 1],
          [0, 1, BOARD_WIDTH, BOARD_WIDTH + 1],
          [0, 1, BOARD_WIDTH, BOARD_WIDTH + 1],
          [0, 1, BOARD_WIDTH, BOARD_WIDTH + 1],
        ];
        break;
      case BLOCK_TYPE.S:
        this.orientationsArray = [
          [
            BOARD_WIDTH + 1,
            BOARD_WIDTH + 2,
            2 * BOARD_WIDTH,
            2 * BOARD_WIDTH + 1,
          ],
          [0, BOARD_WIDTH, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1],
          [
            BOARD_WIDTH + 1,
            BOARD_WIDTH + 2,
            2 * BOARD_WIDTH,
            2 * BOARD_WIDTH + 1,
          ],
          [0, BOARD_WIDTH, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1],
        ];
        break;
      case BLOCK_TYPE.Z:
        this.orientationsArray = [
          [
            BOARD_WIDTH,
            BOARD_WIDTH + 1,
            2 * BOARD_WIDTH + 1,
            2 * BOARD_WIDTH + 2,
          ],
          [2, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH + 1],
          [
            BOARD_WIDTH,
            BOARD_WIDTH + 1,
            2 * BOARD_WIDTH + 1,
            2 * BOARD_WIDTH + 2,
          ],
          [2, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH + 1],
        ];
        break;
      case BLOCK_TYPE.I:
        this.orientationsArray = [
          [1, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1, 3 * BOARD_WIDTH + 1],
          [BOARD_WIDTH, BOARD_WIDTH + 1, BOARD_WIDTH + 2, BOARD_WIDTH + 3],
          [1, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1, 3 * BOARD_WIDTH + 1],
          [BOARD_WIDTH, BOARD_WIDTH + 1, BOARD_WIDTH + 2, BOARD_WIDTH + 3],
        ];
        break;
      default:
        throw "invalid blockType";
    }
  }

  // set board's square position index for this block
  setPosition(offset) {
    this.position += offset;
  }

  // change orientation of the block
  setOrientation() {
    this.orientation = this.orientation === 3 ? 0 : this.orientation + 1;
  }

  // get board squares index that are occupied by the block
  getCurrentSquares() {
    const x = this.orientationsArray[this.orientation].map(
      (indexPart) => this.position + indexPart
    );
    return x;
  }
}

const board = new Board();
board.createBoard();
board.init();
