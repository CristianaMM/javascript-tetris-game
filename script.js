const instructionbtn = document.querySelector(".instructions");
const instructionsModal = document.querySelector(".instructionsModal");
const modalCloseBtn = document.querySelector(".closeButton");

instructionbtn.addEventListener("click", () => {
  instructionsModal.style.display = "flex";
});

modalCloseBtn.addEventListener("click", () => {
  instructionsModal.style.display = "none";
});
