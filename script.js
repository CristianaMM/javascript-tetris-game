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
    this.squares = [];
    this.createBoard();
    this.resetGame();
    //Create Listeners - keyboard
    this.createListeners();
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
      div.classList.add("board__square", "blocked", "board__footer");
      this.board.appendChild(div);
    }

    //Add all squares in board to an array so each one have an index number
    this.squares = Array.from(document.querySelectorAll(".board div")); // used Array.from because it did not accept the .splice() used in the getScore() function.
  }

  resetGame() {
    this.block = null;
    this.userInput = false;
    this.prevPositionInBoard = null;
    this.score = 0;

    this.squares.forEach((square) => {
      if (!square.classList.contains("board__footer")) {
        square.classList.remove("blocked");
      }
    });
  }

  // Event Listeners to handle key press (move and rotate block)
  createListeners() {
    document.addEventListener("keyup", (e) => {
      if (e.code === "ArrowDown") {
        this.userInput = false;
      }
    });
    document.addEventListener("keydown", (e) => {
      if (!this.block) {
        return;
      }

      switch (e.code) {
        case "ArrowDown":
          this.block.setCurrentPosition(BOARD_WIDTH, this.squares);
          this.drawBlock();
          this.userInput = true;
          break;
        case "ArrowUp":
          this.block.setOrientation();
          this.drawBlock();
          break;
        case "ArrowRight":
          let isAtRightEdge = this.block
            .getCurrentBlockSquares()
            .some((squareIndex) => (squareIndex + 1) % BOARD_WIDTH === 0);

          if (!isAtRightEdge) {
            this.block.setCurrentPosition(1, this.squares);
            this.drawBlock();
          }

          break;
        case "ArrowLeft":
          let isAtLeftEdge = this.block
            .getCurrentBlockSquares()
            .some((squareIndex) => squareIndex % BOARD_WIDTH === 0);

          if (!isAtLeftEdge) {
            this.block.setCurrentPosition(-1, this.squares);
            this.drawBlock();
          }
          break;

        default:
          break;
      }
    });
  }

  startGame() {
    updatePlayPauseLabel();
    //initiate timer, every second block will go down 1 row
    this.timer = setInterval(() => {
      this.generateBlock();
      this.drawBlock();
      if (!this.userInput) {
        this.block.setCurrentPosition(BOARD_WIDTH, this.squares);
      }
      this.getScore();
    }, 750);
  }

  stopGame(isGameOver) {
    clearInterval(this.timer);
    this.timer = null;

    updatePlayPauseLabel();

    if (isGameOver) {
      alert("game over");
      this.resetGame();
    }
  }

  togglePlayPause() {
    if (this.timer) {
      this.stopGame();
    } else {
      this.startGame();
    }
  }

  drawBlock() {
    // undraw block from its let's position
    const prevBlockPosition = this.prevPositionInBoard || [];
    prevBlockPosition.forEach((square) =>
      this.squares[square].classList.remove("block")
    );

    //get squares that will be occupied by the block in the specific position
    const currentSquares = this.block.getCurrentBlockSquares();

    // console.log("currentSquares", currentSquares);
    // console.log("lastPositions", this.lastPositions);
    //console.log("position", this.block.position);

    // if any of the blocks of the new position are already occupied, block will stay in the previous position and a new block will be created.
    const isBlocked = currentSquares.some((squareIndex) =>
      this.squares[squareIndex].classList.contains("blocked")
    );
    const hasFirstRowBlockBlocked = currentSquares.some((x) => x < 10);

    if (isBlocked && hasFirstRowBlockBlocked) {
      this.stopGame(true);
    } else if (isBlocked) {
      this.prevPositionInBoard.forEach((squareIndex) =>
        this.squares[squareIndex].classList.add("blocked")
      );
      this.block = null;
    } else {
      currentSquares.forEach((squareIndex) =>
        this.squares[squareIndex].classList.add("block")
      );

      // keep track of previous position
      this.prevPositionInBoard = currentSquares;
    }
  }

  //generate random block type if there is no current block
  generateBlock() {
    if (!this.block) {
      const typeOfBlock = Math.round(Math.random() * 5);
      this.block = new Block(Object.keys(BLOCK_TYPE)[typeOfBlock]);
      //this.block = new Block(BLOCK_TYPE.Z);
    }
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

      // if every square of that row in occupied, add 10 points to score, remove that row and add an empty row on top of the board
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
}

class Block {
  //initialize a new block with a given type
  constructor(type) {
    this.type = type;
    this.currentPosition = 4; // initial position when block enters the board (middle top of the board)
    this.orientationsArray = []; // all possible orientatios for the type of block
    this.orientation = 0; // first position of this.orientationsArray. When block enters the board will always be in the first orientation (index=0)

    switch (this.type) {
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
    }
  }

  // set the position for each square occupied by the block when the block moves
  setCurrentPosition(offset, boardSquares) {
    const currentSquares = this.getCurrentBlockSquares();
    const willBeBlocked = currentSquares.some((squareIndex) =>
      boardSquares[squareIndex + offset].classList.contains("blocked")
    );
    const isMovingDown = offset === BOARD_WIDTH;

    if (!(willBeBlocked && !isMovingDown)) {
      this.lastPosition = this.currentPosition;
      this.currentPosition += offset;
    }
  }

  // change orientation of the block (rotate block)
  setOrientation() {
    // block Type I is bigger than the rest of blocks
    if (
      this.type === "I" &&
      (this.currentPosition + 2) % BOARD_WIDTH === 0 &&
      (this.orientation === 0 || this.orientation === 2)
    ) {
      this.currentPosition -= 2;
    }

    this.orientation = this.orientation === 3 ? 0 : this.orientation + 1;

    if (
      this.orientationsArray[this.orientation].some(
        (indexPart) => (this.currentPosition + indexPart) % BOARD_WIDTH === 0
      )
    ) {
      this.currentPosition = this.lastPosition;
    }
  }

  // get array with the board squares index that are occupied by the block in the current position
  getCurrentBlockSquares() {
    return this.orientationsArray[this.orientation].map(
      (indexPart) => this.currentPosition + indexPart
    );
  }
}

const startbtn = document.querySelector(".startButton");
const board = new Board();

startbtn.addEventListener("click", () => {
  board.togglePlayPause();
});

function updatePlayPauseLabel() {
  startbtn.innerHTML = startbtn.innerHTML === "Pause" ? "Start" : "Pause";
}

//TO DO:
// when rotate blocks close to margin sometimes it goes to the other side (block.setOrientation() )
// stop blocking blocks when they move to a "blocked" square on the side, only block them when is vertical collision
// sometimes blocks don't block in the end of the board but in the previous position
// update start button label to play/pause
// don't forget to clear timer in the end of the game

// css
