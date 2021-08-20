const instructionbtn = document.querySelector(".instructions");
const instructionsModal = document.querySelector(".instructionsModal");
const modalCloseBtn = document.querySelector(".instructionsModal__closeButton");

//open instructions modal
instructionbtn.addEventListener("click", () => {
  instructionsModal.style.display = "flex";
});

//close instructions modal
modalCloseBtn.addEventListener("click", () => {
  instructionsModal.style.display = "none";
});

//logo animation
const tl = gsap.timeline({
  repeat: -1,
  yoyo: true,
  defaults: { duration: 0.75, ease: "steps(3)" },
});

tl.from(".header__logo .block_l", {
  y: -150,
})
  .from(".header__logo .block_z", {
    y: -150,
  })
  .from(".header__logo .block_o", {
    y: -150,
  })
  .from(".header__logo .block_s", {
    y: -150,
  });
