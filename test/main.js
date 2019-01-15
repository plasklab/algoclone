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

var spr = enchant.Class.create(enchant.Sprite, {
    initialize: function() {
	enchant.Sprite.call(this, 32, 32);
	this.image = game.assets[ADVANCE];
	this.x = 100;
	this.y = 50;
	this.backgroundColor = "blue";
    }
});

window.onload = function() {
    game = new Core(WIDTH, HEIGHT);
    game.fps = 60;
    game.preload(PLAYER, MAP, GOAL, ADVANCE, RIGHT, LEFT, LSTART, LEND,
		 SPEAD, HEART, DIA, CLOVER, PLAY);

    game.onload = function() {
	var s1 = new (enchant.Class.create(enchant.Scene, {
	    initialize: function() {
		enchant.Scene.call(this);
		this.backgroundColor = "white";
		
		var blockUp = new spr;
		this.addChild(blockUp);

		var blockUp2 = new enchant.Sprite(32, 32);
		blockUp2.image = game.assets[ADVANCE];
		blockUp2.x = 50;
		blockUp2.y = 100;
		blockUp2.backgroundColor = "red";
		blockUp2.addEventListener("touchstart", function() {
		    game.pushScene(s2);
		});
		this.addChild(blockUp2);
	    }
	}))();

	var s2 = new (enchant.Class.create(enchant.Scene, {
	    initialize: function() {
		enchant.Scene.call(this);
		this.backgroundColor = "white";
		
		var blockUp2 = new enchant.Sprite(32, 32);
		blockUp2.image = game.assets[ADVANCE];
		blockUp2.x = 50;
		blockUp2.y = 100;
		blockUp2.backgroundColor = "red";
		blockUp2.addEventListener("touchstart", function() {
		    game.popScene();
		});
		this.addChild(blockUp2);
	    }
	}))();
	game.pushScene(s1);
    }
    
    game.start();
    core.debug();
}

