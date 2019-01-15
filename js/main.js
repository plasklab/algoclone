enchant();
const WIDTH = 700;

const HEIGHT = 460;
/* 画像ファイルのパス */
const PLAYER  = "../img/chara5.png";
const MAP     = "../img/map0.gif";
const GOAL    = "../img/goal.png";
const ADVANCE = "../img/advance.png";
const RIGHT   = "../img/right.png";
const LEFT    = "../img/left.png";
const LSTART  = "../img/l_start.png";
const LEND    = "../img/l_end.png";
const SPEAD   = "../img/spead.png";
const HEART   = "../img/heart.png";
const DIA     = "../img/dia.png";
const CLOVER  = "../img/clover.png";
const PLAY    = "../img/play.png";

window.onload = function() {
  game = new Core(WIDTH, HEIGHT);
  game.fps = 60;
  game.preload(PLAYER, MAP, GOAL, ADVANCE, RIGHT, LEFT, LSTART, LEND,
    SPEAD, HEART, DIA, CLOVER, PLAY);

  game.onload = function() {
    var main_menu = new MainMenu();
    game.pushScene(main_menu);
  }

    game.createMap = function(id) {
    if (id == 0) {
      return add_map_1();
    } else if (id == 1) {
      return add_map_2();
    } else if (id == 2) {
      return add_map_3();
    } else if (id == 3) {
      return add_map_4();
    } else if (id == 4) {
      return add_map_5();
    } else if (id == 5) {
      return add_map_6();
    } else if (id == 6) {
      return add_map_7();
    } else if (id == 7) {
      return add_map_8();
    } else if (id == 8) {
      return add_map_9();
    } else if (id == 9) {
      return add_map_10();
    } else if (id == 10) {
      return add_map_11();
    } else if (id == 11) {
      return add_map_12();
    } else if (id == 12) {
      return add_map_13();
    }
    return null;
}

    game.start();
  // core.debug();
}


