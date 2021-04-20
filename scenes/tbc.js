add([
  pos(width() / 2, height() / 2),
  text("To Be Continued\nPress Enter to Return\n\n Your Final Score: " + score)
]);

keyPress("enter", () => {
  bgm.pause();
  bgm.src = "./sounds/th06_01.mp3";
  bgm.load();
  bgm.play();
  go("main");
})