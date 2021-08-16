"use strict";

// Create Board Grid
var board = document.querySelector(".board"); // Add 200 divs in the board grid

for (var i = 0; i < 200; i++) {
  var div = document.createElement("div");
  board.appendChild(div);
}