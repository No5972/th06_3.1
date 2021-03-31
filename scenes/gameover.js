    add([
      pos(width() / 2, height() / 2),
      text("Game Over\nPress Enter to return")
    ]);

    keyPress("enter", () => {
      go("main", {});
    })