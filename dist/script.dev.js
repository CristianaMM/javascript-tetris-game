"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// types of blocks
var BLOCK_TYPE = {
  L: "L",
  T: "T",
  O: "O",
  S: "S",
  Z: "Z",
  I: "I"
}; // amount of squares in each row of the board

var BOARD_WIDTH = 10;

var Board =
/*#__PURE__*/
function () {
  function Board(mode) {
    _classCallCheck(this, Board);

    this.board = document.querySelector(".board");
    this.squares = [];
    this.block = null;
    this.userInput = false;
    this.prevPositionOnBoard = null;
    this.score = 0;
    this.createBoard();
    this.resetGame();
    this.createListeners(); // keyboard

    switch (mode) {
      case "easy":
        this.mode = 1000;
        break;

      case "medium":
        this.mode = 500;
        break;

      case "hard":
        this.mode = 250;
        break;
    }
  }

  _createClass(Board, [{
    key: "createBoard",
    value: function createBoard() {
      // Add 200 divs in the board grid - squares
      for (var i = 0; i < 200; i++) {
        var div = document.createElement("div");
        div.classList.add("board__square");
        this.board.appendChild(div);
      } // Add blocked row in the lower part of the board


      for (var _i = 0; _i < BOARD_WIDTH; _i++) {
        var _div = document.createElement("div");

        _div.classList.add("board__square", "blocked", "board__footer");

        this.board.appendChild(_div);
      } //Add all squares in board to an array so each one have an index number


      this.squares = Array.from(document.querySelectorAll(".board div")); // used Array.from because it did not accept the .splice() used in the getScore() function.
    }
  }, {
    key: "resetGame",
    value: function resetGame() {
      this.block = null;
      this.userInput = false;
      this.prevPositionOnBoard = null;
      this.score = 0;
      this.squares.forEach(function (square) {
        if (!square.classList.contains("board__footer")) {
          square.classList.remove("blocked");
        }
      });
    } // Event Listeners to handle key press (move and rotate block)

  }, {
    key: "createListeners",
    value: function createListeners() {
      var _this = this;

      document.addEventListener("keyup", function (e) {
        if (e.code === "ArrowDown") {
          _this.userInput = false;
        }
      });
      document.addEventListener("keydown", function (e) {
        if (!_this.block) {
          return;
        }

        switch (e.code) {
          case "ArrowDown":
            _this.block.setCurrentPosition(BOARD_WIDTH, _this.squares);

            _this.drawBlock();

            _this.userInput = true;
            break;

          case "ArrowUp":
            _this.block.setOrientation(_this.squares);

            _this.drawBlock();

            break;

          case "ArrowRight":
            var isAtRightEdge = _this.block.getCurrentBlockSquares().some(function (squareIndex) {
              return (squareIndex + 1) % BOARD_WIDTH === 0;
            });

            if (!isAtRightEdge) {
              _this.block.setCurrentPosition(1, _this.squares);

              _this.drawBlock();
            }

            break;

          case "ArrowLeft":
            var isAtLeftEdge = _this.block.getCurrentBlockSquares().some(function (squareIndex) {
              return squareIndex % BOARD_WIDTH === 0;
            });

            if (!isAtLeftEdge) {
              _this.block.setCurrentPosition(-1, _this.squares);

              _this.drawBlock();
            }

            break;

          default:
            break;
        }
      });
    }
  }, {
    key: "togglePlayPause",
    value: function togglePlayPause() {
      if (this.timer) {
        this.stopGame();
      } else {
        this.startGame();
      }
    }
  }, {
    key: "startGame",
    value: function startGame() {
      var _this2 = this;

      updatePlayPauseLabel(); //initiate timer, every second block will go down 1 row

      this.timer = setInterval(function () {
        _this2.generateBlock();

        _this2.drawBlock();

        if (!_this2.userInput) {
          _this2.block.setCurrentPosition(BOARD_WIDTH, _this2.squares);
        }

        _this2.getScore();
      }, this.mode);
    }
  }, {
    key: "stopGame",
    value: function stopGame(isGameOver) {
      clearInterval(this.timer);
      this.timer = null;
      updatePlayPauseLabel();

      if (isGameOver) {
        alert("game over");
        this.resetGame();
      }
    }
  }, {
    key: "drawBlock",
    value: function drawBlock() {
      var _this3 = this;

      // undraw block from its last position
      var prevBlockPosition = this.prevPositionOnBoard || [];
      prevBlockPosition.forEach(function (square) {
        return _this3.squares[square].classList.remove("block");
      }); //get squares that will be occupied by the block on the board

      var currentSquares = this.block.getCurrentBlockSquares(); // if any of the blocks of the new position are already occupied, block will stay in the previous position and a new block will be created.

      var isBlocked = currentSquares.some(function (squareIndex) {
        return _this3.squares[squareIndex].classList.contains("blocked");
      });
      var isInFirstRow = currentSquares.some(function (x) {
        return x < 10;
      });

      if (isBlocked && isInFirstRow) {
        this.stopGame(true);
      } else if (isBlocked) {
        this.prevPositionOnBoard.forEach(function (squareIndex) {
          return _this3.squares[squareIndex].classList.add("blocked");
        });
        this.block = null;
      } else {
        currentSquares.forEach(function (squareIndex) {
          return _this3.squares[squareIndex].classList.add("block");
        }); // keep track of previous position

        this.prevPositionOnBoard = currentSquares;
      }
    } //generate random block type if there is no current block

  }, {
    key: "generateBlock",
    value: function generateBlock() {
      if (!this.block) {
        var typeOfBlock = Math.round(Math.random() * 6);
        this.block = new Block(Object.keys(BLOCK_TYPE)[typeOfBlock]);
      }
    }
  }, {
    key: "getScore",
    value: function getScore() {
      var _this4 = this;

      var displayScore = document.querySelector(".score");

      for (var i = 0; i < 199; i += BOARD_WIDTH) {
        // each row of the board
        var row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]; // if every square of that row in occupied, add 10 points to score, remove that row and add an empty row on top of the board

        if (row.every(function (square) {
          return _this4.squares[square].classList.contains("blocked");
        })) {
          this.score += 10;
          displayScore.innerHTML = this.score;
          row.forEach(function (square) {
            return _this4.squares[square].classList.remove("blocked");
          });
          var squaresToRemove = this.squares.splice(i, BOARD_WIDTH);
          this.squares = squaresToRemove.concat(this.squares);
          this.squares.forEach(function (square) {
            return _this4.board.appendChild(square);
          });
        }
      }
    }
  }]);

  return Board;
}();

var Block =
/*#__PURE__*/
function () {
  //initialize a new block with a given type
  function Block(type) {
    _classCallCheck(this, Block);

    this.type = type;
    this.currentPosition = 4; // initial position when block enters the board (middle top of the board)

    this.orientationsArray = []; // all possible orientatios for the type of block

    this.orientation = 0; // first position of this.orientationsArray. When block enters the board will always be in the first orientation (index=0)

    this.currentRow = 0; // row on the board

    switch (this.type) {
      case BLOCK_TYPE.L:
        this.orientationsArray = [[0, 1, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1], [BOARD_WIDTH + 2, 2 * BOARD_WIDTH, 2 * BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 2], [1, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 2], [BOARD_WIDTH, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH]];
        break;

      case BLOCK_TYPE.J:
        this.orientationsArray = [[1, 2, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1], [BOARD_WIDTH, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH + 2], [1, BOARD_WIDTH + 1, 2 * BOARD_WIDTH, 2 * BOARD_WIDTH + 1], [BOARD_WIDTH, 2 * BOARD_WIDTH, 2 * BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 2]];
        break;

      case BLOCK_TYPE.T:
        this.orientationsArray = [[1, BOARD_WIDTH, BOARD_WIDTH + 1, BOARD_WIDTH + 2], [1, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH + 1], [BOARD_WIDTH, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH + 1], [1, BOARD_WIDTH, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1]];
        break;

      case BLOCK_TYPE.O:
        this.orientationsArray = [[0, 1, BOARD_WIDTH, BOARD_WIDTH + 1], [0, 1, BOARD_WIDTH, BOARD_WIDTH + 1], [0, 1, BOARD_WIDTH, BOARD_WIDTH + 1], [0, 1, BOARD_WIDTH, BOARD_WIDTH + 1]];
        break;

      case BLOCK_TYPE.S:
        this.orientationsArray = [[1, 2, BOARD_WIDTH, BOARD_WIDTH + 1], [0, BOARD_WIDTH, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1], [1, 2, BOARD_WIDTH, BOARD_WIDTH + 1], [0, BOARD_WIDTH, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1]];
        break;

      case BLOCK_TYPE.Z:
        this.orientationsArray = [[0, 1, BOARD_WIDTH + 1, BOARD_WIDTH + 2], [2, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH + 1], [0, 1, BOARD_WIDTH + 1, BOARD_WIDTH + 2], [2, BOARD_WIDTH + 1, BOARD_WIDTH + 2, 2 * BOARD_WIDTH + 1]];
        break;

      case BLOCK_TYPE.I:
        this.orientationsArray = [[1, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1, 3 * BOARD_WIDTH + 1], [BOARD_WIDTH, BOARD_WIDTH + 1, BOARD_WIDTH + 2, BOARD_WIDTH + 3], [1, BOARD_WIDTH + 1, 2 * BOARD_WIDTH + 1, 3 * BOARD_WIDTH + 1], [BOARD_WIDTH, BOARD_WIDTH + 1, BOARD_WIDTH + 2, BOARD_WIDTH + 3]];
        break;
    }
  } // set the position for each square occupied by the block when the block moves


  _createClass(Block, [{
    key: "setCurrentPosition",
    value: function setCurrentPosition(offset, boardSquares) {
      var currentSquares = this.getCurrentBlockSquares();
      var willBeBlocked = currentSquares.some(function (squareIndex) {
        return boardSquares[squareIndex + offset].classList.contains("blocked");
      });
      var isMovingDown = offset === BOARD_WIDTH;

      if (!(willBeBlocked && !isMovingDown)) {
        this.currentPosition += offset;
        this.currentRow = offset === BOARD_WIDTH ? this.currentRow + 1 : this.currentRow;
      }
    } // change orientation of the block (rotate block)

  }, {
    key: "setOrientation",
    value: function setOrientation(boardSquares) {
      var _this5 = this;

      var newOrientation = this.orientation === 3 ? 0 : this.orientation + 1;
      var positionsAfterRotation = this.orientationsArray[newOrientation].map(function (i) {
        return _this5.currentPosition + i;
      });
      var willBeBlocked = positionsAfterRotation.some(function (i) {
        return boardSquares[i].classList.contains("blocked");
      }); // don't allow to rotate if new position will be on top of blocked squares

      this.orientation = willBeBlocked ? this.orientation : newOrientation; //handle with rotation close to edges

      var isOnLeft = this.currentPosition - this.currentRow * 10 > 4 && (this.type === "I" || this.currentPosition - this.currentRow * 10 < 9) ? false : true; // included collumn 9 on left because of the way the blocks are defined.

      var isOnFirstCollumn = this.orientationsArray[this.orientation].some(function (indexPart) {
        return (_this5.currentPosition + indexPart) % BOARD_WIDTH === 0;
      });
      var isOnLastCollumn = this.orientationsArray[this.orientation].some(function (indexPart) {
        return (_this5.currentPosition + indexPart + 1) % BOARD_WIDTH === 0;
      });

      if (isOnLeft && isOnLastCollumn) {
        this.currentPosition += 1;
      } else if (!isOnLeft && isOnFirstCollumn && this.type === "I") {
        this.currentPosition -= 2; // block type "I" is bigger than the rest
      } else if (!isOnLeft && isOnFirstCollumn) {
        this.currentPosition -= 1;
      }
    } // get array with the board squares index that are occupied by the block in the current position

  }, {
    key: "getCurrentBlockSquares",
    value: function getCurrentBlockSquares() {
      var _this6 = this;

      return this.orientationsArray[this.orientation].map(function (indexPart) {
        return _this6.currentPosition + indexPart;
      });
    }
  }]);

  return Block;
}(); //TO DO:
// sometimes blocks don't block in the end of the board but in the previous position
// css


var easyButton = document.querySelector(".modeButtons__easy");
var mediumButton = document.querySelector(".modeButtons__medium");
var hardButton = document.querySelector(".modeButtons__hard");
console.log(easyButton);
easyButton.addEventListener("click", function () {
  var board = new Board("easy");
});
mediumButton.addEventListener("click", function () {
  var board = new Board("medium");
});
hardButton.addEventListener("click", function () {
  var board = new Board("hard");
});
var startbtn = document.querySelector(".info__startButton");
startbtn.addEventListener("click", function () {
  board.togglePlayPause();
});

function updatePlayPauseLabel() {
  startbtn.innerHTML = startbtn.innerHTML === "Pause" ? "Start" : "Pause";
}