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
const BSTART  = "../img/b_start.png";
const BEND    = "../img/b_end.png";
const SPEAD   = "../img/spead.png";
const HEART   = "../img/heart.png";
const DIA     = "../img/dia.png";
const CLOVER  = "../img/clover.png";
const S_SPEAD = "../img/spead_start.png";
const S_HEART = "../img/heart_start.png";
const S_DIA   = "../img/dia_start.png";
const S_CLOVER= "../img/clover_start.png";
const ARG     = "../img/arg.png";
const BLANK   = "../img/blank_block.png";
const PLAY    = "../img/play.png";
const CLEAR   = "../img/clear.png";
const GAMEOVER= "../img/end.png";
const COIN    = "../img/coin.png";
const INSERT  = "../img/insert_highlight.png";
const REPLACE = "../img/replace_highlight.png";
const UP      = "../img/up.png";
const DOWN    = "../img/down.png";

window.onload = function() {
  game = new Core(WIDTH, HEIGHT);
  game.fps = 60;
  game.preload(PLAYER, MAP, GOAL, ADVANCE, RIGHT, LEFT, LSTART, LEND, BSTART, BEND,
    SPEAD, HEART, DIA, CLOVER, S_SPEAD, S_HEART, S_DIA, S_CLOVER, ARG, BLANK, PLAY,
    CLEAR, GAMEOVER, COIN, INSERT, REPLACE, UP, DOWN);

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
