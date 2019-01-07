enchant();
const WIDTH = 700;
const HIGHT = 460;
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
  game = new Core(WIDTH, HIGHT);
  game.fps = 60;
  game.preload(PLAYER, MAP, GOAL, ADVANCE, RIGHT, LEFT, LSTART, LEND,
    SPEAD, HEART, DIA, CLOVER, PLAY);

  game.onload = function() {
    // 0 <= stage_id <= 12
    var stage_id = 3;
    stage = new Stage(stage_id);
    game.pushScene(stage);
    stage.display();
  }

  game.start();
  // core.debug();
}