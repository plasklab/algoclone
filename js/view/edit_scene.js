var BlockToken = enchant.Class.create({
    initialize: function(type) {
	this.type = type;
    }
});

var BlockTokenForward = enchant.Class.create(BlockToken, {
    initialize: function() {
	BlockToken.call(this, "F");
    }
});

var BlockTokenLeft = enchant.Class.create(BlockToken, {
    initialize: function() {
	BlockToken.call(this, "L");
    }
});

var BlockTokenRight = enchant.Class.create(BlockToken, {
    initialize: function() {
	BlockToken.call(this, "R");
    }
});

var BlockTokenLoopBegin = enchant.Class.create(BlockToken, {
    initialize: function(n) {
	BlockToken.call(this, "[");
	this.count = n;
    }
});

var BlockTokenLoopEnd = enchant.Class.create(BlockToken, {
    initialize: function() {
	BlockToken.call(this, "]");
    }
});

var PaletteBlock = enchant.Class.create(enchant.Sprite, {
    initialize: function(scene, x, y, imgsrc) {
	enchant.Sprite.call(this, 32, 32);
	this.x = x;
	this.y = y;
	this.image = game.assets[imgsrc];

	this.scene = scene;
	this.imgsrc = imgsrc;
	this.program = "";

	this.inPalette = true;
	this.clkOffX = 0;
	this.clkOffY = 0;
	
	this.addEventListener("touchmove", function(e) {
	    this.x = e.x - this.clkOffX;
	    this.y = e.y - this.clkOffY;
	});

	this.addEventListener("touchend", function() {
	    this.scene.removeChild(this);
	});

	this.addEventListener("touchstart", function(e) {
	    if (this.inPalette) {
		this.inPalette = false;
		var b = new PaletteBlock(scene, x, y, imgsrc);
		this.scene.addChild(b);
	    }
	    this.clkOffX = e.x - this.x;
	    this.clkOffY = e.y - this.y;
	});

	this.scene.addChild(this);
    },
});

var EditScene = enchant.Class.create(enchant.Scene, {
    initialize: function(id) {
	enchant.Scene.call(this);
	this.backgroundColor = "white";

	/*
	 * layout scene
	 */

	/* map */
	var map = game.createMap(id);
	this.map = map;
	this.addChild(map);
	this.addChild(new Player(map.init_x,
				 map.init_y,
				 map.init_direction));
	this.addChild(new Goal(map.goal_x, map.goal_y));
	
    /* palette */
    var xOffset = map.x + map.width + 10;
    var yOffset = 10;
    var BLANK = "blank"; // 配置を調整するための空き領域を表す
    var paletteArray = [ADVANCE, BLANK, RIGHT, LEFT, BSTART, BEND, S_SPEAD, S_HEART, S_DIA, S_CLOVER, SPEAD, HEART, DIA, CLOVER];

    var paletteWidth = 76; /* img_size 32 * 2 + margin 4 * 3(left,center,right) */
    var paletteHeight = Math.floor(paletteArray.length / 2) * 36 + 4;
    var paletteBackground = new (enchant.Class.create(enchant.Sprite, {
        initialize: function(x, y, width, height){
            enchant.Sprite.call(this, width,height);
            this.x = x;
            this.y = y;
            var surface = new Surface(width, height);
            surface.context.fillStyle = "lightgray";
            surface.context.fillRect(0, 0, width, height);
            this.image = surface;
        }
    }))(xOffset - 4, yOffset - 4, paletteWidth, paletteHeight);
    this.addChild(paletteBackground);

    // paletteArrayの中身に従ってblockを配置
    for (var index = 0; index < paletteArray.length; index++) {
        /* 配置を調整するためのblankはなにも描画しない */
        if (paletteArray[index] == BLANK) continue;
        /* 横2列に1,2,\n 3,4,\n 5,6,...と配置する */
        var y = Math.floor(index / 2) * 36;
        var x = index % 2 == 0 ? 0:36;
        new PaletteBlock(this, x + xOffset, y + yOffset, paletteArray[index]);
    }

    /* editor zone */


	/* play button */
	var playButton = new (enchant.Class.create(enchant.Sprite, {
	    initialize: function(editScene) {
		enchant.Sprite.call(this, 32, 32);
		this.image = game.assets[PLAY];
		this.x = 32;
		this.y = map.y + map.height + 10;
		this.editScene = editScene;
		this.addEventListener("touchstart", function() {
		    game.pushScene(new PlayScene(id,
						 this.editScene.getProgram()));
		});
	    },
	}))(this);
	this.addChild(playButton);
    },

    getProgram: function() {
	var program = [
	    new BlockTokenForward(),
	    new BlockTokenLoopBegin(9),
	    new BlockTokenLeft(),
	    new BlockTokenLoopEnd()
	];
	    
	return program;
    },

  reset: function(id) {
    this.map = this.set_map(id);
    this.player = new Player(this.map.init_x, this.map.init_y, this.map.init_direction);
    this.goal = new Goal(this.map.goal_x, this.map.goal_y);
    this.blocks = this.set_blocks();
    this.prog = new Prog(this.blocks[0].x + this.blocks[0].height + 20, 10);
    // is_touch : ブロックを作れるタイミングを管理
    this.is_touch = true;
    // play_flag : プログラムを実行しているか管理
    this.play_flag = false;
    // arg_play : どの引数ブロックが実行中かを判断
    this.arg_play = [];
    
    this.control_panel = new ControlPanel(this);
      
    this.playButton = new enchant.Class.create(enchant.Sprite, {
	initialize: function() {
	    this.image = game.assets[PLAY];
	    this.x = PLAY_BUTTON_X;
	    this.y = PLAY_BUTTON_Y;
	    this.addEventListener("touchstart", function() {
		var playScene = new PlayScene(this.map, this.program);
		game.pushScene(playScene);
		playScene.display();
	    });
	}
    });
  },

  set_blocks: function() {
    var b = [];
    var map_x = this.map.x + this.map.width + 10;
    b.push(new Up());
    b[0].set_block(map_x, 10, "silver", this);
    b.push(new Rotate_right());
    b[1].set_block(map_x, this.set_y(b[0]), "silver", this);
    b.push(new Rotate_left());
    b[2].set_block(map_x, this.set_y(b[1]), "silver", this);
    b.push(new Loop());
    b[3].set_block(map_x, this.set_y(b[2]), this);
    b.push(new Func_id("spead"));
    b[4].set_block(map_x, this.set_y(b[3]), "silver", this);
    b.push(new Func_id("heart"));
    b[5].set_block(map_x, this.set_y(b[4]), "silver", this);
    b.push(new Func_id("dia"));
    b[6].set_block(map_x, this.set_y(b[5]), "silver", this);
    b.push(new Func_id("clover"));
    b[7].set_block(map_x, this.set_y(b[6]), "silver", this);
    b.push(new Param(0));
    b[8].set_block(map_x, this.set_y(b[7]), "aquamarine", this);
    b.push(new Param(1));
    b[9].set_block(map_x, this.set_y(b[8]), "gold", this);
    b.push(new Param(2));
    b[10].set_block(map_x, this.set_y(b[9]), "pink", this);
    return b;
  },

  set_y: function(b) {
    return b.y + b.height + 5;
  },

  display: function() {
    this.display_heads();
    this.display_blocks();
    this.display_play();
    this.display_map();
    this.display_goal();
    this.display_player();
  },

  remove: function() {
    this.remove_blocks();
    this.remove_play();
  },

  display_blocks: function() {
    for (var i = 0; i < this.blocks.length; i++) {
      if (i == 3) {
        this.blocks[i].loop_addChild(this);
        continue;
      }
      this.addChild(this.blocks[i]);
    }
  },

  remove_blocks: function() {
    for (var i = 0; i < this.blocks.length; i++) {
      if (i == 3) {
        this.blocks[i].remove_block(this);
        continue;
      }
      this.removeChild(this.blocks[i]);
    }
  },

  display_play: function() {
    this.addChild(this.play);
  },

  remove_play: function() {
    this.removeChild(this.play);
  },

  display_heads: function() {
    this.addChild(this.prog.main_space);
    this.addChild(this.prog.s_space);
    this.addChild(this.prog.s_head);
    this.addChild(this.prog.h_space);
    this.addChild(this.prog.h_head);
    this.addChild(this.prog.d_space);
    this.addChild(this.prog.d_head);
    this.addChild(this.prog.c_space);
    this.addChild(this.prog.c_head);
  },

  display_map: function() {
    this.addChild(this.map);
  },

  display_player: function() {
    this.addChild(this.player);
  },

  display_goal: function() {
    this.addChild(this.goal);
  },
});
