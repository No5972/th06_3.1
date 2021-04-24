    add([
      pos(width() / 2, height() / 2),
      text("Stage Clear\nPress Enter to Continue")
    ]);

    keyPress("enter", () => {
      bgm.pause();
      bgm.src = "./sounds/th06_04.mp3";
      bgm.load();
      bgm.play();
      go("level2", {});
    })