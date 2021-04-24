	const BULLET_SPEED = 1000;
  const ENEMY_BULLET_SPEED = 100;
	const ENEMY_SPEED = 100;
	const PLAYER_SPEED = 200;
  const INITIAL_POWERUP_POINT_SPEED = -60;
  const INITIAL_POWERUP_POWER_SPEED = -50;

  let isFiring = false;
  let power = 1.0;
  let position = 0;
  let life = 3;
  let isRespawning = false;
  let isInvincible = false;
  let isFocusing = false;
  let isBossExist = false;

  gravity(200);

  var bgm = document.getElementById("bgm");

  bgm.ontimeupdate = function () {
    if (bgm.currentTime >= bgm.duration - 0.2) {
      bgm.currentTime = 21;
      bgm.play();
    }
  }

  function mapWidth() {
    return width() / 3 * 2;
  }

  const MAX_BOSS_HP_BAR_WIDTH = mapWidth() - 110;

  function getDirection(ex, ey) {
    var dx = player.pos.x - ex;
    var dy = player.pos.y - ey;
    var r = Math.hypot(player.pos.x - ex, player.pos.y - ey);
    if (dx <= 0 && dy >= 0) return Math.asin(Math.abs(dy) / r);
    if (dx >= 0 && dy >= 0) return Math.PI - Math.asin(Math.abs(dy) / r);
    if (dx >= 0 && dy <= 0) return Math.asin(Math.abs(dy) / r) + Math.PI;
    if (dx <= 0 && dy <= 0) return Math.PI * 2 - Math.asin(Math.abs(dy) / r);
  }

  const enemyALocation = [ 9, 12, 13, 14, 22, 23, 24, 
                         109, 112, 113, 114, 122, 123, 124,
                         209, 212, 213, 214, 222, 223, 224,
                         // small boss
                         309, 312, 313, 314, 322, 323, 324,
                         409, 412, 413, 414, 422, 423, 424,
                         509, 512, 513, 514, 522, 523, 524];
  const enemyBLocation = [32, 34, 36, 38, 40, 52, 54, 56, 58, 60,
                       132, 134, 136, 138, 140, 152, 154, 156, 158, 160,
                       232, 234, 236, 238, 240, 252, 254, 256, 258, 260,
                       // small boss
                       232, 234, 236, 238, 240, 252, 254, 256, 258, 260,
                       332, 334, 336, 338, 340, 352, 354, 356, 358, 360,
                       432, 434, 436, 438, 440, 452, 454, 456, 458, 460];
  const enemyCLocation = [31, 33, 35, 37, 39, 51, 53, 55, 57, 59,
                      131, 133, 135, 137, 139, 151, 153, 155, 157, 159,
                      231, 233, 235, 237, 239, 251, 253, 255, 257, 259,
                      // small boss
                      331, 333, 335, 337, 339, 351, 353, 355, 357, 359,
                      431, 433, 435, 437, 439, 451, 453, 455, 457, 459,
                      531, 533, 535, 537, 539, 551, 553, 555, 557, 559];
  const enemyDLocation = [72, 74, 76, 78, 80, 92, 94, 96, 98, 100,
                      172, 174, 176, 178, 180, 192, 194, 196, 198, 200,
                      272, 274, 276, 278, 280, 292, 294, 296, 298, 300,
                      // small boss
                      372, 374, 376, 378, 380, 392, 394, 396, 398, 400,
                      472, 474, 476, 478, 480, 492, 494, 496, 498, 500,
                      572, 574, 576, 578, 580, 592, 594, 596, 598, 600];

  const boss1Location = [301];
  // const boss2Location = [1];
  const boss2Location = [601];
  
  // play("th06_02");

	let player = add([
		sprite("player01"),
		pos(mapWidth() / 2, height() - 15),
		scale(1),
    "player"
	]);

  let playerHitJudgePoint = add([
    sprite("hitpoint"),
    pos(player.pos.x, player.pos.y),
    scale(0.7),
    "playerHitJudgePoint"
  ]);

  let bossHPBar = add([
    rect(MAX_BOSS_HP_BAR_WIDTH, 10),
    pos(65, 10),
    color(1,1,1),
    origin("left")
  ]);

  let bossRunes = add([
    pos(5, 7),
		text("Enemy 0"),
		// all objects defaults origin to center, we want score text to be top left
		origin("topleft"),
		// plain objects becomes fields of score
		{
			value: 0,
		},
  ]);

  bossHPBar.hidden = true;
  bossRunes.hidden = true;

	keyDown("left", () => {
    if (player.pos.x > 0) {
		  player.move(-PLAYER_SPEED * (isFocusing ? 0.5 : 1), 0);
    } else {
      player.pos.x = 0;
    }
	});

	keyDown("right", () => {
    if (player.pos.x < mapWidth()) {
		  player.move(PLAYER_SPEED * (isFocusing ? 0.5 : 1), 0);
    } else {
      player.pos.x = mapWidth();
    }
	});

  keyDown("up", () => {
    if (player.pos.y > 0) {
		  player.move(0, -PLAYER_SPEED * (isFocusing ? 0.5 : 1));
    } else {
      player.pos.y = 0;
    }
	});

  keyDown("down", () => {
    if (player.pos.y < height()) {
		  player.move(0, PLAYER_SPEED * (isFocusing ? 0.5 : 1));
    } else {
      player.pos.y = height();
    }
	});

  keyDown("z", () => { isFiring = true; });

  keyRelease("z", () => { isFiring = false; });

  keyDown("shift", () => { isFocusing = true;});

  keyRelease("shift", () => { isFocusing = false;}); // shift key has issues

/*
	keyPress("space", () => {
		add([
			sprite("bullet00"),
			pos(player.pos),
			// strings here means a tag
			"bullet",
		]);
	});
*/
	// run this callback every frame for all objects with tag "bullet"
	action("bullet", (b) => {
		b.move(Math.cos(b.direction) * BULLET_SPEED, -Math.sin(b.direction) * BULLET_SPEED);
		// remove the bullet if it's out of the scene for performance
		if (b.pos.y < 0 || b.pos.x < 0 || b.pos.x > mapWidth()) {
			destroy(b);
		}
	});

	function spawnEnemyA() { return add([	sprite("enemy00"),	pos(rand(0, mapWidth()), 0), "enemyA", {
    time: 0
  }]);}
  function spawnEnemyB() { return add([	sprite("enemy00"),	pos(0, 48), "enemyB", {
    time: 0
  }]);}
  function spawnEnemyC() { return add([	sprite("enemy00"),	pos(mapWidth(), 48), "enemyC", {
    time: 0
  }]);}
  function spawnEnemyD() { return add([	sprite("enemy01"),	pos(rand(0, mapWidth()), 0), "enemyD", {
    time: 0
  }]);}

  function spawnBoss1() {
    isBossExist = true;
    bossHPBar.hidden = false;
    bossHPBar.width = MAX_BOSS_HP_BAR_WIDTH;
    bossRunes.hidden = false;
    bossRunes.text = "Enemy 0";
    return add([
      sprite("boss01"),
      pos(mapWidth() / 2, 0),
      "boss01", {
        time: 0,
        life: 200,
        rune: 2, // runes
        maxLife: 200,
        maxRune: 2,
        countdown: 60,
        downspeed: 1,
        isLanding: true,
        damaku: [[
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 2, speed: 100, begin: 111},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 4, speed: 100, begin: 111},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 6, speed: 100, begin: 111},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 8, speed: 100, begin: 111},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 10, speed: 100, begin: 111},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 12, speed: 100, begin: 111},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 14, speed: 100, begin: 111},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 16, speed: 100, begin: 111},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 18, speed: 100, begin: 111},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 20, speed: 100, begin: 111},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 22, speed: 100, begin: 111},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 24, speed: 100, begin: 111},

          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 1, speed: 100, begin: 101},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 3, speed: 100, begin: 101},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 5, speed: 100, begin: 101},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 7, speed: 100, begin: 101},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 9, speed: 100, begin: 101},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 11, speed: 100, begin: 101},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 13, speed: 100, begin: 101},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 15, speed: 100, begin: 101},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 17, speed: 100, begin: 101},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 19, speed: 100, begin: 101},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 21, speed: 100, begin: 101},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 23, speed: 100, begin: 101},

          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 1, speed: 100, begin: 121},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 3, speed: 100, begin: 121},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 5, speed: 100, begin: 121},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 7, speed: 100, begin: 121},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 9, speed: 100, begin: 121},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 11, speed: 100, begin: 121},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 13, speed: 100, begin: 121},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 15, speed: 100, begin: 121},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 17, speed: 100, begin: 121},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 19, speed: 100, begin: 121},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 21, speed: 100, begin: 121},
          {sprite: "eb1", interval: 100, direction: Math.PI / 12 * 23, speed: 100, begin: 121},
        ]]
      }
    ])
  }

  action("boss01", (e) => {
    if (e.pos.y < 80 && e.isLanding) {
      e.pos.y += e.downspeed;
      return;
    } else {
      e.isLanding = false;
    }
    e.time++;

    e.pos.x = mapWidth() / 2 + Math.cos(e.time / 100 + Math.PI / 2) * 100;
    e.pos.y = 60 + Math.sin(e.time / 100 + Math.PI / 2) * 20;
    
    for (var x in e.damaku[0]) {
      if ((e.time - e.damaku[0][x].begin) % e.damaku[0][x].interval == 0) {
        play("se_tan01", {volume: 0.02});
        if (e.damaku[e.maxRune - e.rune][x].direction != null) {
          add([	
            sprite(e.damaku[e.maxRune - e.rune][x].sprite),	
            pos(e.pos.x, e.pos.y), "bossBullet1", {
              direction: e.damaku[e.maxRune - e.rune][x].direction,
              speed: e.damaku[e.maxRune - e.rune][x].speed
            }
          ]);
        } else {
          add([	
            sprite(e.damaku[e.maxRune - e.rune][x].sprite),	
            rotate(getDirection(e.pos.x, e.pos.y)) , 
            pos(e.pos.x, e.pos.y), "bossBullet1", {
              direction: getDirection(e.pos.x, e.pos.y),
              speed: e.damaku[e.maxRune - e.rune][x].speed
            }
          ]);
        }
      }
    }
    
  });

  collides("bullet", "boss01", (bullet, boss) => {
    boss.life--;
    destroy(bullet);
    bossHPBar.width = MAX_BOSS_HP_BAR_WIDTH * boss.life / boss.maxLife;
    score.value += 11;
		score.text = "Score   " + score.value;
    if (boss.life <= 0) {
      play("bossDestroy", {volume : 0.7});
      destroy(boss);
      bossHPBar.hidden = true;
      bossRunes.hidden = true;
      isBossExist = false;
    }
  });

  function spawnBoss2() {
    bgm.pause();
    bgm.src = "./sounds/th06_09.mp3";
    bgm.load();
    bgm.play();
    isBossExist = true;
    bossHPBar.hidden = false;
    bossHPBar.width = MAX_BOSS_HP_BAR_WIDTH;
    bossRunes.hidden = false;
    bossRunes.text = "Enemy 1";
    return add([
      sprite("boss01"),
      pos(mapWidth() / 2, 0),
      "boss02", {
        time: 0,
        life: 500, // current life 
        rune: 2, // runes
        maxLife: 500, // life of each rune
        maxRune: 2,
        countdown: 60,
        downspeed: 1,
        isLanding: true,
        damaku: [[
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 2, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 4, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 6, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 8, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 10, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 12, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 14, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 16, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 18, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 20, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 22, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 24, speed: 200, begin: 101},

          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 1, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 3, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 5, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 7, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 9, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 11, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 13, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 15, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 17, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 19, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 21, speed: 200, begin: 101},
          {sprite: "eb1", interval: 50, direction: Math.PI / 12 * 23, speed: 200, begin: 101}
        ],[
          // null => sniper
          {sprite: "eb2", interval: 30, direction: null, speed: 100, directionOffset: 0, begin: 111},
          {sprite: "eb2", interval: 30, direction: null, directionOffset: Math.PI / 24 * 1, speed: 110, begin: 111},
          {sprite: "eb2", interval: 30, direction: null, directionOffset: Math.PI / -24 * 1, speed: 110, begin: 111},
          {sprite: "eb2", interval: 30, direction: null, directionOffset: Math.PI / -24 * 2, speed: 105, begin: 111},
          {sprite: "eb2", interval: 30, direction: null, directionOffset: Math.PI / -24 * 2, speed: 105, begin: 111},
          {sprite: "eb2", interval: 30, direction: null, 
          directionOffset: Math.PI / -24 * 3, speed: 115, begin: 111},
          {sprite: "eb2", interval: 30, direction: null, directionOffset: Math.PI / -24 * 3, speed: 115, begin: 111},
          {sprite: "eb2", interval: 30, direction: null, 
          directionOffset: Math.PI / -24 * 4, speed: 120, begin: 111},
          {sprite: "eb2", interval: 30, direction: null, directionOffset: Math.PI / -24 * 4, speed: 120, begin: 111},
        ]]
      }
    ])
  }

  action("boss02", (e) => {
    if (e.pos.y < 80 && e.isLanding) {
      e.pos.y += e.downspeed;
      return;
    } else {
      e.isLanding = false;
    }
    e.time++;

    e.pos.x = mapWidth() / 2 + Math.cos(e.time / 100 + Math.PI / 2) * 100;
    e.pos.y = 60 + Math.sin(e.time / 100 + Math.PI / 2) * 20;
    
    for (var x in e.damaku[e.maxRune - e.rune]) {
      if ((e.time - e.damaku[e.maxRune - e.rune][x].begin) % e.damaku[e.maxRune - e.rune][x].interval == 0) {
        play("se_tan01", {volume: 0.05});
        if (e.damaku[e.maxRune - e.rune][x].direction != null) {
          add([	
            sprite(e.damaku[e.maxRune - e.rune][x].sprite),	
            pos(e.pos.x, e.pos.y), "bossBullet1", {
              direction: e.damaku[e.maxRune - e.rune][x].direction,
              speed: e.damaku[e.maxRune - e.rune][x].speed
            }
          ]);
        } else {
          add([	
            sprite(e.damaku[e.maxRune - e.rune][x].sprite),	
            rotate(getDirection(e.pos.x, e.pos.y) - e.damaku[e.maxRune - e.rune][x].directionOffset + Math.PI / 2) , 
            pos(e.pos.x, e.pos.y), "bossBullet1", {
              direction: Math.PI - getDirection(e.pos.x, e.pos.y) + e.damaku[e.maxRune - e.rune][x].directionOffset,
              speed: e.damaku[e.maxRune - e.rune][x].speed
            }
          ]);
        }
      }
    }
  });

  collides("bullet", "boss02", (bullet, boss) => {
    boss.life--;
    destroy(bullet);
    bossHPBar.width = MAX_BOSS_HP_BAR_WIDTH * boss.life / boss.maxLife;
    score.value += 11;
		score.text = "Score   " + score.value;
    if (boss.life <= 0) {
      play("bossDestroy", {volume : 0.5});
      if (boss.rune <= 1) {
        destroy(boss);
        bossHPBar.hidden = true;
        bossRunes.hidden = true;
        isBossExist = false;
        bgm.pause();
        // debugger;
        go("levelup", {
          score: score,
          life: life,
          power: power
        });
      } else {
        boss.rune--;
        bossRunes.text = "Enemy " + (boss.rune - 1);
        boss.life = boss.maxLife;
      }
    }
  });

  function convertAllBullets() { // when defeating a rune of a boss

  }

  function removeAllBullets() { // bomb

  }

  const hudBorder = add([
    // width, height
    rect(209, 470),
    pos(533, 240),
    color(1, 1, 1),
  ]);

  const hud = add([
    // width, height
    rect(207, 468),
    pos(533, 240),
    color(0, 0, 0),
  ]);

	const score = add([
		pos(width() - 200, 12),
		text("Score   0"),
		// all objects defaults origin to center, we want score text to be top left
		origin("topleft"),
		// plain objects becomes fields of score
		{
			value: 0,
		},
	]);

  const powerText = add([
    pos(width() - 200, 20),
    text("Power   1.0"),
    origin("topleft"),
    {}
  ])

  const lifeText = add([
    pos(width() - 200, 28),
    text("Player  " + life),
    origin("topleft"),
    {}
  ])

  function defeatAnEnemy(b, e) {
    play("kill", {volume: 0.3});
		destroy(b);
		destroy(e);
		score.value += 100;
		score.text = "Score   " + score.value;

    let rand = Math.random();
    if (rand > 0.6) {
      add([
        sprite("point"),
        pos(e.pos),
        body(),
        // strings here means a tag
        "powerup-point",
      ]);
    }

    if (rand > 0.1 && rand <= 0.4) {
      add([
        sprite("power"),
        pos(e.pos),
        body(),
        // strings here means a tag
        "powerup-power",
      ]);
    }
  }

	// if a "bullet" and a "enemy" collides, remove both of them
	collides("bullet", "enemyA", (b, e) => { defeatAnEnemy(b, e); });
  collides("bullet", "enemyB", (b, e) => { defeatAnEnemy(b, e); });
  collides("bullet", "enemyC", (b, e) => { defeatAnEnemy(b, e); });
  collides("bullet", "enemyD", (b, e) => { defeatAnEnemy(b, e); });


  collides("player", "powerup-point", (p, pp) => {
    if (isRespawning) { return; }
    play("pick", {volume: 0.5});
    let getScore = parseInt(100 + height() - p.pos.y);
    if (getScore > 800) {
      getScore = 800;
    }
    score.value += getScore;
    score.text = "Score   " + score.value;
    destroy(pp);
  });

  collides("player", "powerup-power", (p, pp) => {
    if (isRespawning) { return; }
    play("pick", {volume: 0.5});
    if (power < 10) {
      //power+=2.3;
      power+=0.3;
      powerText.text = "Power   " + power.toFixed(1);
      if (power > 10) {
        power = 10;
        powerText.text = "Power   MAX";
      }
      
    }
    destroy(pp);
  });

  function playerHit(p, e) {
    if (isInvincible || isRespawning) { return; }
    isRespawning = true;
    play("hit");
    life--;
    power--;
    if (power < 1) { power = 1; }
    lifeText.text = "Player  " + life;
    powerText.text = "Power   " + power.toFixed(1);
    if (life < 0) {
      bgm.pause();
      go("gameover", score);
      return;
    }
    destroy(e);
    p.hidden = true;
    player.hidden = true;
    wait(2, () => {
      player.pos.x = mapWidth() / 2;
      player.pos.y = height() - 15;
      p.hidden = false;
      player.hidden = false;
      isRespawning = false;
      isInvincible = true;
      wait(3, () => {
        isInvincible = false;
      });
    });
  }

  collides("playerHitJudgePoint", "enemyBullet1", (e, eb) => { playerHit(e, eb); });
  collides("playerHitJudgePoint", "enemyBullet2", (e, eb) => { playerHit(e, eb); });
  collides("playerHitJudgePoint", "bossBullet1", (e, eb) => { playerHit(e, eb); });
  collides("playerHitJudgePoint", "enemyA", (e, eb) => { playerHit(e, eb); });
  collides("playerHitJudgePoint", "enemyB", (e, eb) => { playerHit(e, eb); });
  collides("playerHitJudgePoint", "enemyC", (e, eb) => { playerHit(e, eb); });
  collides("playerHitJudgePoint", "enemyD", (e, eb) => { playerHit(e, eb); });
  

	action("enemyA", (e) => {
		e.move(0, ENEMY_SPEED);
    e.time++;
    if (e.time == 50) { // enemy shoot
      add([	
        sprite("eb2"), 
        rotate(getDirection(e.pos.x, e.pos.y) + Math.PI / 2) , 
        pos(e.pos.x, e.pos.y), 
        "enemyBullet2", {
          direction: getDirection(e.pos.x, e.pos.y)
        }
      ]);
    }
		if (e.pos.y > height()) {
			destroy(e);
		}
	});

  action("enemyB", (e) => {
		e.move(ENEMY_SPEED, 0);
    e.time++;
    if (e.time == 50) { // enemy shoot
      add([	
        sprite("eb2"), 
        rotate(getDirection(e.pos.x, e.pos.y) + Math.PI / 2) , 
        pos(e.pos.x, e.pos.y), 
        "enemyBullet2", {
          direction: getDirection(e.pos.x, e.pos.y)
        }
      ]);
    }
		if (e.pos.x > mapWidth()) {
			destroy(e);
		}
	});

  action("enemyC", (e) => {
    e.time++;
		e.move(-ENEMY_SPEED, 0);
    if (e.time == 50) { // enemy shoot
      add([	
        sprite("eb2"), 
        rotate(getDirection(e.pos.x, e.pos.y) + Math.PI / 2) , 
        pos(e.pos.x, e.pos.y), 
        "enemyBullet2", {
          direction: getDirection(e.pos.x, e.pos.y)
        }
      ]);
    }
		if (e.pos.x < 0) {
			destroy(e);
		}
	});

  action("enemyD", (e) => {
		e.move(0, ENEMY_SPEED);
    e.time++;
    if (e.time % 100 == 0) { // enemy shoot
      let randDirection = rand(0, Math.PI * 2);
      for (let i = 0; i < 6; i ++) {
        add([	sprite("eb1"),	pos(e.pos.x, e.pos.y), "enemyBullet1", {
          direction: randDirection + ((Math.PI / 3) * i)
        }]);
      }
    }
		if (e.pos.y > height()) {
			destroy(e);
		}
	});

  action("powerup-point", (pp) => {
    let currentSpeed = INITIAL_POWERUP_POINT_SPEED;
    pp.move(0, currentSpeed++);
    if (pp.pos > height()) {
      destroy(pp);
    }
  });

  action("powerup-power", (pp) => {
    let currentSpeed = INITIAL_POWERUP_POWER_SPEED;
    pp.move(0, currentSpeed++);
    if (pp.pos > height()) {
      destroy(pp);
    }
  });

  action("enemyBullet1", (eb) => {
    let currentSpeed = ENEMY_BULLET_SPEED;
    eb.move(Math.cos(eb.direction) * currentSpeed, Math.sin(eb.direction) * currentSpeed);
    if (eb.pos.x < 0 || eb.pos.x > mapWidth() || eb.pos.y < 0 || eb.pos.y > height()) {
      destroy(eb);
    }
  });

  action("enemyBullet2", (eb) => {
    let currentSpeed = ENEMY_BULLET_SPEED;
    eb.move(Math.cos(eb.direction) * currentSpeed * -1, Math.sin(eb.direction) * currentSpeed);
    if (eb.pos.x < 0 || eb.pos.x > mapWidth() || eb.pos.y < 0 || eb.pos.y > height()) {
      destroy(eb);
    }
  });

  action("bossBullet1", (eb) => {
    let currentSpeed = eb.speed;
    eb.move(Math.cos(eb.direction) * currentSpeed, Math.sin(eb.direction) * currentSpeed);
    if (eb.pos.x < 0 || eb.pos.x > mapWidth() || eb.pos.y < 0 || eb.pos.y > height()) {
      destroy(eb);
    }
  });

  action("player", (p) => {
    playerHitJudgePoint.pos.x = p.pos.x + 2;
    playerHitJudgePoint.pos.y = p.pos.y - 2;
  });

	// spawn an enemy every 1 second
	loop(0.3, () => {
    if (!isBossExist) {
      position++;
    }
    if (boss1Location.lastIndexOf(position) != -1 && !isBossExist) spawnBoss1();
    if (boss2Location.lastIndexOf(position) != -1 && !isBossExist) spawnBoss2();
    if (enemyALocation.lastIndexOf(position) != -1) spawnEnemyA();
    if (enemyBLocation.lastIndexOf(position) != -1) spawnEnemyB();
    if (enemyCLocation.lastIndexOf(position) != -1) spawnEnemyC();
    if (enemyDLocation.lastIndexOf(position) != -1) spawnEnemyD();
  });

  loop(0.075, () => {
    if (isFiring && !isRespawning) {
      play("fire", {volume: 0.3});
      // console.log(isFocusing);
      for (let i = 0; i < parseInt(power); i++) {
        add([
          sprite("bullet00"),
          pos(player.pos),
          // strings here means a tag
          "bullet",
          {
            direction: Math.PI / 2 + ((isFocusing ? 0.03 : 0.07) * parseInt(i + 1 / 2) * Math.pow(-1, i))
          }
        ]);
      }
    } 
  });