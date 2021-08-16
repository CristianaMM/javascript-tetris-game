// Create Board Grid
const board = document.querySelector(".board");

// Add 200 divs in the board grid
for (let i = 0; i < 200; i++) {
  const div = document.createElement("div");
  div.classList.add("board__square");
  board.appendChild(div);
}

//Add all squares in board to an array so each one have an index number
const squaresInBoard = document.querySelectorAll(".board div");

const boardWidth = 10; // amount of squares in each row

// Create an array for all the possible positions of each block type. Then create an array with all the block types and possible positions

const blockL = [
  [1, 2, boardWidth + 1, 2 * boardWidth + 1],
  [boardWidth, boardWidth + 1, boardWidth + 2, 2 * boardWidth + 2],
  [1, boardWidth + 1, 2 * boardWidth, 2 * boardWidth + 1],
  [boardWidth, 2 * boardWidth, 2 * boardWidth + 1, 2 * boardWidth + 2],
];

const blockT = [
  [1, boardWidth, boardWidth + 1, boardWidth + 2],
  [1, boardWidth + 1, boardWidth + 2, 2 * boardWidth + 1],
  [boardWidth, boardWidth + 1, boardWidth + 2, 2 * boardWidth + 1],
  [1, boardWidth, boardWidth + 1, 2 * boardWidth + 1],
];

const blockO = [
  [0, 1, boardWidth, boardWidth + 1],
  [0, 1, boardWidth, boardWidth + 1],
  [0, 1, boardWidth, boardWidth + 1],
  [0, 1, boardWidth, boardWidth + 1],
];

const blockS = [
  [boardWidth + 1, boardWidth + 2, 2 * boardWidth, 2 * boardWidth + 1],
  [0, boardWidth, boardWidth + 1, 2 * boardWidth + 1],
  [boardWidth + 1, boardWidth + 2, 2 * boardWidth, 2 * boardWidth + 1],
  [0, boardWidth, boardWidth + 1, 2 * boardWidth + 1],
];

const blockZ = [
  [boardWidth, boardWidth + 1, 2 * boardWidth + 1, 2 * boardWidth + 2],
  [2, boardWidth + 1, boardWidth + 2, 2 * boardWidth + 1],
  [boardWidth, boardWidth + 1, 2 * boardWidth + 1, 2 * boardWidth + 2],
  [2, boardWidth + 1, boardWidth + 2, 2 * boardWidth + 1],
];

const blockI = [
  [1, boardWidth + 1, 2 * boardWidth + 1, 3 * boardWidth + 1],
  [boardWidth, boardWidth + 1, boardWidth + 2, boardWidth + 3],
  [1, boardWidth + 1, 2 * boardWidth + 1, 3 * boardWidth + 1],
  [boardWidth, boardWidth + 1, boardWidth + 2, boardWidth + 3],
];

const blocks = [blockL, blockT, blockO, blockS, blockZ, blockI];

let currentPosition = 4;
let currentBlock = blocks[0][0];

//Draw block on the board
function drawBlock() {
  currentBlock.forEach((indexPart) => {
    squaresInBoard[currentPosition + indexPart].classList.add("block");
  });
}

drawBlock();
