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

	this.addEventListener("touchend", function(e) {
        this.scene.dropBlock(e.x, e.y, this.imgsrc);
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

var EditorBlock = enchant.Class.create(enchant.Sprite, {
    initialize: function(scene, lineId, index, offsetX, offsetY) {
        enchant.Sprite.call(this, 32, 32);
        this.scene = scene;
        var blockSize = 32;
        this.x = offsetX + lineId * (blockSize + 15);
        this.y = offsetY + index * blockSize;
        this.image = game.assets[BLANK];
        this.imgsrc = BLANK;
        this.scene.addChild(this);
    },
    changeToken: function(imgsrc) {
        this.image = game.assets[imgsrc];
        this.imgsrc = imgsrc;
        this.scene.addChild(this);
    },
    getToken: function() {
        return this.imgsrc;
    },
});

var FillSquare = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, width, height){
        enchant.Sprite.call(this, width,height);
        this.x = x;
        this.y = y;
        var surface = new Surface(width, height);
        surface.context.fillStyle = "lightgray";
        surface.context.strokeStyle = "black"
        surface.context.strokeRect(0, 0, width, height);
        this.image = surface;
    }
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
    const PALETTE_OFFSET_X = map.x + map.width + 10;
    const PALETTE_OFFSET_Y = 10;

    var paletteArray = [ADVANCE, BLANK, RIGHT, LEFT, BSTART, BEND, S_SPEAD, S_HEART, S_DIA, S_CLOVER, ARG];

    const PALETTE_WIDTH = 76; /* img_size 32 * 2 + margin 4 * 3(left,center,right) */
    const PALETTE_HEIGHT = Math.round(paletteArray.length / 2) * 36 + 4;
    var paletteBackground = new FillSquare(PALETTE_OFFSET_X - 4, PALETTE_OFFSET_Y - 4, PALETTE_WIDTH, PALETTE_HEIGHT);
    this.addChild(paletteBackground);


    /* editor zone */
    /* paletteArrayよりも下のレイヤに描画する必要があるため先に描画 */
    this.EDITOR_X = PALETTE_OFFSET_X + PALETTE_WIDTH + 24;
    this.EDITOR_Y = PALETTE_OFFSET_Y;
    this.BLOCK_SIZE = 32;
    this.EDITOR_PROGRAM_TOP = this.EDITOR_Y + this.BLOCK_SIZE;
    this.EDITOR_BLOCK_MARGIN = 4;
    this.BLOCK_NUM = 12;

    var editorBackground = new FillSquare(
        this.EDITOR_X - this.EDITOR_BLOCK_MARGIN,
        this.EDITOR_PROGRAM_TOP - this.EDITOR_BLOCK_MARGIN,
        this.BLOCK_SIZE + this.EDITOR_BLOCK_MARGIN * 2,
        this.BLOCK_NUM * this.BLOCK_SIZE + this.EDITOR_BLOCK_MARGIN * 2);
    this.addChild(editorBackground);

    this.mainProgramArray = [];

    /* main program */
    for (var i = 0; i < this.BLOCK_NUM; i++) {
        this.mainProgramArray[i] = new EditorBlock(this, 0, i, this.EDITOR_X, this.EDITOR_PROGRAM_TOP);
    }

    // paletteArrayの中身に従ってblockを配置
    for (var index = 0; index < paletteArray.length; index++) {
        /* 横2列に1,2,\n 3,4,\n 5,6,...と配置する */
        var y = Math.floor(index / 2) * 36;
        var x = index % 2 == 0 ? 0:36;
        new PaletteBlock(this, x + PALETTE_OFFSET_X, y + PALETTE_OFFSET_Y, paletteArray[index]);
    }

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

    dropBlock: function(x, y, token) {
        /* in program line to edit main program */
        console.log("(" + x + "," + y +")");
        console.log("this.EDITOR_X: " + this.EDITOR_X);
        console.log("this.EDITOR_PROGRAM_TOP: " + this.EDITOR_PROGRAM_TOP);
        console.log("this.EDITOR_HEIGHT: " + this.BLOCK_NUM * this.BLOCK_SIZE);
        if (x >= this.EDITOR_X &&
            x <= this.EDITOR_X + this.BLOCK_SIZE &&
            y >= this.EDITOR_PROGRAM_TOP &&
            y <= this.EDITOR_PROGRAM_TOP + this.BLOCK_NUM * this.BLOCK_SIZE) {
            /* change new token */
            var index = Math.floor((y - this.EDITOR_PROGRAM_TOP) / this.BLOCK_SIZE);
            this.mainProgramArray[index].changeToken(token);
            return true;
        }
        return false;
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