// types of blocks
const BLOCK_TYPE = {
  L: "L",
  T: "T",
  O: "O",
  S: "S",
  Z: "Z",
  I: "I",
};

// amount of squares in each row of the board
const BOARD_WIDTH = 10;

class Board {
  constructor() {
    this.board = document.querySelector(".board");
    this.score = 0;
  }

  createBoard() {
    // Add 200 divs in the board grid - squares
    for (let i = 0; i < 200; i++) {
      const div = document.createElement("div");
      div.classList.add("board__square");
      this.board.appendChild(div);
    }
    // Add blocked row in the lower part of the board
    for (let i = 0; i < BOARD_WIDTH; i++) {
      const div = document.createElement("div");
      div.classList.add("board__square", "blocked");
      this.board.appendChild(div);
    }

    //Add all squares in board to an array so each one have an index number
    this.squares = Array.from(document.querySelectorAll(".board div")); // used Array.from because it did not accept the .splice() used in the getScore() function.

    //Create Listeners - keyboard
    this.createListeners();
  }

  drawBlock() {
    //get squares that will be occupied by the block in the specific position
    const currentSquares = this.block.getCurrentBlockSquares();

    // if any of the blocks of the new position are already occupied, block will stay in the previous position and a new block will be created.
    const isBlocked = currentSquares.some((squareIndex) =>
      this.squares[squareIndex].classList.contains("blocked")
    );

    if (isBlocked) {
      this.lastPositions.forEach((squareIndex) =>
        this.squares[squareIndex].classList.add("blocked")
      );
      this.block = null;
    } else {
      currentSquares.forEach((squareIndex) =>
        this.squares[squareIndex].classList.add("block")
      );

      // keep track of previous position
      this.lastPositions = currentSquares;
    }
  }

  undrawBlock() {
    const lastPositionSquares = this.lastPositions || [];
    lastPositionSquares.forEach((square) =>
      this.squares[square].classList.remove("block")
    );
  }

  //generate random block type if there is no current block
  generateBlock() {
    const typeOfBlock = Math.round(Math.random() * 5);

    if (!this.block)
      this.block = new Block(Object.keys(BLOCK_TYPE)[typeOfBlock]);
  }

  // Event Listeners to handle key press (move and rotate block)
  createListeners() {
    document.addEventListener("keydown", (e) => {
      if (!this.block) {
        return;
      }
      switch (e.code) {
        case "ArrowDown":
          this.undrawBlock();
          this.block.setPosition(BOARD_WIDTH);
          this.drawBlock();
          break;
        case "ArrowUp":
          this.undrawBlock();
          this.block.setOrientation();

          this.drawBlock();
          break;
        case "ArrowRight":
          let isAtRightEdge = this.block
            .getCurrentBlockSquares()
            .some((squareIndex) => (squareIndex + 1) % BOARD_WIDTH === 0);

          if (!isAtRightEdge) {
            this.undrawBlock();
            this.block.setPosition(1);
            this.drawBlock();
          }

          break;
        case "ArrowLeft":
          let isAtLeftEdge = this.block
            .getCurrentBlockSquares()
            .some((squareIndex) => squareIndex % BOARD_WIDTH === 0);

          if (!isAtLeftEdge) {
            this.undrawBlock();
            this.block.setPosition(-1);
            this.drawBlock();
          }
          break;

        default:
          break;
      }
    });
  }

  getScore() {
    const displayScore = document.querySelector(".score");

    for (let i = 0; i < 199; i += BOARD_WIDTH) {
      // each row of the board
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 8,
        i + 9,
      ];

      // if every square of that row in occupied, add 10 points to score, remove that row and add a new empty row on top of the board
      if (
        row.every((square) =>
          this.squares[square].classList.contains("blocked")
        )
      ) {
        this.score += 10;
        displayScore.innerHTML = this.score;
        row.forEach((square) =>
          this.squares[square].classList.remove("blocked")
        );

        const squaresToRemove = this.squares.splice(i, BOARD_WIDTH);
        this.squares = squaresToRemove.concat(this.squares);
        this.squares.forEach((square) => this.board.appendChild(square));
      }
    }
  }

  //initiate timer, every second block will go down 1 row
  init() {
    // don't forget to clear timer in the end of the game
    let startbtn = document.querySelector(".startButton");

    startbtn.addEventListener("click", () => {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      } else {
        this.timer = setInterval(() => {
          this.generateBlock();
          this.undrawBlock();
          this.drawBlock();
          this.block.setPosition(BOARD_WIDTH);
          this.getScore();
        }, 750);
      }
    });
  }
}

class Block {
  //initialize a new block with a given blockType
  constructor(blockType) {
    this.blockType = blockType;
    this.position = 4; // initial position when block enters the board (middle top of the board)
    this.orientation = 0; // first position of this.orientationsArray. When block enters the board will always be in the first orientation (index=0)

    //define this.orientationsArray (all possible orientatios for the type of block)
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
          [1, 2, BOARD_WIDTH, BOARD_WIDTH + 1],
          [0, BOARD_WIDTH, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1],
          [1, 2, BOARD_WIDTH, BOARD_WIDTH + 1],
          [0, BOARD_WIDTH, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1],
        ];
        break;
      case BLOCK_TYPE.Z:
        this.orientationsArray = [
          [0, 1, BOARD_WIDTH + 1, BOARD_WIDTH + 2],
          [2, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH + 1],
          [0, 1, BOARD_WIDTH + 1, BOARD_WIDTH + 2],
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

  // set the position for each square occupied by the block when the block moves
  setPosition(offset) {
    this.lastPosition = this.position;
    this.position += offset;
  }

  // change orientation of the block (rotate block)
  setOrientation() {
    this.orientation = this.orientation === 3 ? 0 : this.orientation + 1;
    if (
      this.orientationsArray[this.orientation].some(
        (indexPart) => (this.position + indexPart) % BOARD_WIDTH === 0
      )
    ) {
      this.position = this.lastPosition;
    }
  }

  // get array with the board squares index that are occupied by the block in the current position
  getCurrentBlockSquares() {
    return this.orientationsArray[this.orientation].map(
      (indexPart) => this.position + indexPart
    );
  }
}

const board = new Board();
board.createBoard();
board.init();

//TO DO:
// block I when does not fit when rotates close to margin
// when rotate blocks close to margin sometimes it goes to the other side
// stop blocking blocks when they move to a "blocked" square on the side, only block them when is vertical collision
//sometimes blocks don't block in the end of the board but in the previous position

// css
