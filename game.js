// types of blocks
const BLOCK_TYPE = {
  L: "L",
  T: "T",
  O: "O",
  S: "S",
  Z: "Z",
  I: "I",
  J: "J",
};

// amount of squares in each row of the board
const BOARD_WIDTH = 10;

class Board {
  constructor() {
    this.board = document.querySelector(".board");
    this.squares = [];
    this.block = null;
    this.prevPositionOnBoard = null;
    this.score = 0;
    this.mode = 1000;
    this.createBoard();
    this.resetGame();
    this.createListeners(); // keyboard

    //get the difficulty level in the URL params
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    const mode = params.mode || "easy";

    switch (mode) {
      case "easy":
        this.mode = 750;
        break;

      case "medium":
        this.mode = 250;
        break;

      case "hard":
        this.mode = 100;
        break;
    }
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
    this.prevPositionOnBoard = null;
    this.score = 0;

    //clean all blocks from board apart the initial blocked footer blocks
    this.squares.forEach((square) => {
      if (!square.classList.contains("board__footer")) {
        square.classList.remove("blocked");
      }
    });
  }

  // Event Listeners to handle key press (move and rotate block)
  createListeners() {
    document.addEventListener("keydown", (e) => {
      if (!this.block) {
        return;
      }

      switch (e.code) {
        case "ArrowDown":
          this.block.setCurrentPosition(BOARD_WIDTH, this.squares);
          this.drawBlock();
          break;
        case "ArrowUp":
          this.block.setOrientation(this.squares);
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

  togglePlayPause() {
    if (this.timer) {
      this.stopGame();
    } else {
      this.startGame();
    }
  }

  startGame() {
    updatePlayPauseLabel();
    //initiate timer, every second block will go down 1 row
    this.timer = setInterval(() => {
      this.generateBlock();
      this.drawBlock();
      this.block.setCurrentPosition(BOARD_WIDTH, this.squares);
      this.getScore();
    }, this.mode);
  }

  stopGame(isGameOver) {
    clearInterval(this.timer);
    this.timer = null;

    updatePlayPauseLabel();

    if (isGameOver) {
      const displayScore = document.querySelector(".score");

      updateFinalScoreLabel(this.score);
      gameOverModal.style.display = "flex";
      displayScore.innerHTML = 0;
      this.resetGame();
    }
  }

  drawBlock() {
    // undraw block from its last position
    const prevBlockPosition = this.prevPositionOnBoard || [];

    //remove block from prev position
    prevBlockPosition.forEach((square) =>
      this.squares[square].classList.remove(
        "block",
        `block_${this.block.type.toLowerCase()}`
      )
    );

    //get squares that will be occupied by the block on the board
    const currentSquares = this.block.getCurrentBlockSquares();

    // if any of the blocks of the new position are already occupied, block will stay in the previous position and a new block will be created.
    const isBlocked = currentSquares.some((squareIndex) =>
      this.squares[squareIndex].classList.contains("blocked")
    );
    const isInFirstRow = currentSquares.some((x) => x < 10);

    // if a block is blocked in the first row it is game over
    if (isBlocked && isInFirstRow) {
      this.stopGame(true);
    } else if (isBlocked) {
      this.prevPositionOnBoard.forEach((squareIndex) =>
        this.squares[squareIndex].classList.add("blocked")
      );
      this.block = null;
    } else {
      currentSquares.forEach((squareIndex) =>
        this.squares[squareIndex].classList.add(
          "block",
          `block_${this.block.type.toLowerCase()}`
        )
      );

      // keep track of previous position
      this.prevPositionOnBoard = currentSquares;
    }
  }

  //generate random block type if there is no current block
  generateBlock() {
    if (!this.block) {
      const typeOfBlock = Math.round(Math.random() * 6);
      this.block = new Block(Object.keys(BLOCK_TYPE)[typeOfBlock]);
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
    this.currentRow = 0; // row on the board

    switch (this.type) {
      case BLOCK_TYPE.L:
        this.orientationsArray = [
          [0, 1, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1],
          [
            BOARD_WIDTH + 2,
            2 * BOARD_WIDTH,
            2 * BOARD_WIDTH + 1,
            2 * BOARD_WIDTH + 2,
          ],
          [1, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 2],
          [BOARD_WIDTH, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH],
        ];
        break;
      case BLOCK_TYPE.J:
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
      this.currentPosition += offset;
      this.currentRow =
        offset === BOARD_WIDTH ? this.currentRow + 1 : this.currentRow;
    }
  }

  // change orientation of the block (rotate block)
  setOrientation(boardSquares) {
    const newOrientation = this.orientation === 3 ? 0 : this.orientation + 1;

    const positionsAfterRotation = this.orientationsArray[newOrientation].map(
      (i) => this.currentPosition + i
    );
    const willBeBlocked = positionsAfterRotation.some((i) =>
      boardSquares[i].classList.contains("blocked")
    );

    // don't allow to rotate if new position will be on top of blocked squares
    this.orientation = willBeBlocked ? this.orientation : newOrientation;

    //handle with rotation close to edges
    const isOnLeft =
      this.currentPosition - this.currentRow * 10 > 4 &&
      (this.type === "I" || this.currentPosition - this.currentRow * 10 < 9)
        ? false
        : true; // included collumn 9 on left because of the way the blocks are defined.

    const isOnFirstCollumn = this.orientationsArray[this.orientation].some(
      (indexPart) => (this.currentPosition + indexPart) % BOARD_WIDTH === 0
    );
    const isOnLastCollumn = this.orientationsArray[this.orientation].some(
      (indexPart) => (this.currentPosition + indexPart + 1) % BOARD_WIDTH === 0
    );

    if (isOnLeft && isOnLastCollumn) {
      this.currentPosition += 1;
    } else if (!isOnLeft && isOnFirstCollumn && this.type === "I") {
      this.currentPosition -= 2; // block type "I" is bigger than the rest
    } else if (!isOnLeft && isOnFirstCollumn) {
      this.currentPosition -= 1;
    }
  }

  // get array with the board squares index that are occupied by the block in the current position
  getCurrentBlockSquares() {
    return this.orientationsArray[this.orientation].map(
      (indexPart) => this.currentPosition + indexPart
    );
  }
}

const startbtn = document.querySelector(".info__startButton");

const audio = document.querySelector("audio");

const audioControl = document.querySelector(".info__audioControl");

const playAgainBtn = document.querySelector(".gameOverModal__playAgain");

const gameOverModal = document.querySelector(".gameOverModal");

const board = new Board();

// start/pause game and audio
startbtn.addEventListener("click", () => {
  board.togglePlayPause();
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});

function updatePlayPauseLabel() {
  startbtn.innerHTML = startbtn.innerHTML === "Pause" ? "Start" : "Pause";
}

//mute & unmute audio
audioControl.addEventListener("click", () => {
  audio.muted = !audio.muted;
  audioControl.innerHTML =
    audioControl.innerHTML == '<i class="fas fa-volume-mute"></i>'
      ? '<i class="fas fa-volume-up"></i>'
      : '<i class="fas fa-volume-mute"></i>';
});

playAgainBtn.addEventListener("click", () => {
  gameOverModal.style.display = "none";
});

//show final score on gameOver modal
function updateFinalScoreLabel(score) {
  const scoreLabel = document.querySelector(".finalScore");
  scoreLabel.innerHTML = score;
}
