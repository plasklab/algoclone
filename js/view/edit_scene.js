const PROGRAM_MAIN = "main";
const PALETTE_ZONE = "palette";
const FUNC_NAME = ["spead", "heart", "dia", "clover"];
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
        var index = this.scene.getIndexByLocation(e.x, e.y);
        if (index != -1 && index != PALETTE_ZONE) {
            console.log(Math.floor(index));
            var target = this.scene.getBlockByIndex(Math.floor(index));
            var clickInPart = (Math.floor(index*4)) % 4;
            if (clickInPart == 0 || clickInPart == 3) {
                /* insert at before block */
                this.scene.insertBlock(index, this.imgsrc);
            } else {
                /* change block */
                target.changeBlock(this.imgsrc);
            }
        }
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
        this.x = offsetX + lineId * (blockSize + this.scene.EDITOR_MARGIN);
        this.y = offsetY + index * blockSize;
        this.clkOffX = 0;
        this.clkOffY = 0;
        this.origX = this.x;
        this.origY = this.y;
        this.image = game.assets[BLANK];
        this.imgsrc = BLANK;
        /* LoopのためのcountLabelを生成しておく */
        this.countLabel = new Label("1");
        this.countLabel.font = "10px monospace";
        this.moveCountLabel();
        this.countLabel.color = "black";
        this.countLabel.visible = false;
        this.scene.addChild(this.countLabel);
        this.scene.addChild(this);
        this.addEventListener("touchstart", function(e) {
            this.clkOffX = e.x - this.x;
            this.clkOffY = e.y - this.y;
        });

        this.addEventListener("touchmove", function(e) {
            if (this.getBlockName() != BLANK) {
                this.x = e.x - this.clkOffX;
                this.y = e.y - this.clkOffY;
                this.moveCountLabel();
            }
        });
        
        this.addEventListener("touchend", function(e) {
            this.x = this.origX;
            this.y = this.origY;
            this.moveCountLabel();
            this.clkOffX = 0;
            this.clkOffY = 0;
            /* BLANKの場合動かせない */
            if (this.getBlockName() == BLANK) return;
            var index = this.scene.getIndexByLocation(e.x, e.y);
            /* 見当違いな場所に配置した場合 */
            if (index == -1) {
                return;
            }
            /* palette zoneにドロップしたら削除 */
            if (index == PALETTE_ZONE) {
                this.setBlank();
/*                if (this.countLabel.visible) {
                    this.scene.removeChild(this.countLabel);
                }
                this.imgsrc = BLANK;
                this.image = game.assets[BLANK];*/
                return;
            }
            var target = this.scene.getBlockByIndex(Math.floor(index));
            /* 移動先が自分だった場合、置き換えない */
            /* 置き換えない場合で、かつループブロックの場合はループ回数を増加 */
            if (target != this) {
                var blockName = this.getBlockName();
                var count = this.getCount();
                this.setBlank();
                var clickInPart = (Math.floor(index*4)) % 4;
                if (clickInPart == 0 || clickInPart == 3) {
                    /* insert at before block */
                    this.scene.insertBlock(index + 1, target.getBlockName());
                } else {
                    /* change block */
                    target.replaceBlock(blockName, count);
                }
                target.replaceBlock(blockName, count)
            } else if (this.imgsrc == BSTART) {
                if (this.countLabel.text > 9) {
                    this.countLabel.text = 1;
                } else {
                    this.countLabel.text++;
                }
            }
        });
    },
    replaceBlock: function(blockName,count) {
        this.changeBlock(blockName);
        /* Blockがループの始端だったらcountを引き継ぐ */
        if (this.getBlockName() == BSTART) {
            this.setCount(count);
        }
    },
    setBlank: function() {
        this.setCount(1);
        this.imgsrc = BLANK;
        this.image = game.assets[BLANK];
        this.countLabel.visible = false;
    },
    changeBlock: function(imgsrc) {
        this.countLabel.visible = (imgsrc == BSTART);
        this.setCount(1);
        this.image = game.assets[imgsrc];
        this.imgsrc = imgsrc;
        this.scene.addChild(this);
    },
    getBlockName: function() {
        return this.imgsrc;
    },
    getCount: function() {
        if (this.imgsrc == BSTART) {
            return parseInt(this.countLabel.text);
        } else {
            return 0;
        }
    },
    setCount: function(count) {
        this.countLabel.text = count;
    },
    moveCountLabel: function() {
        this.countLabel.x = this.x + 16;
        this.countLabel.y = this.y + 16;
    }
});

var FillSquare = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, width, height){
        enchant.Sprite.call(this, width,height);
        this.x = x;
        this.y = y;
        var surface = new Surface(width, height);
        surface.context.strokeStyle = "black";
        surface.context.strokeRect(0, 0, width, height);
        this.image = surface;
    }
});

var DrawImage = enchant.Class.create(enchant.Sprite, {
    initialize: function(scene, x, y, width, height, imgsrc) {
        enchant.Sprite.call(this, width, height);
        this.x = x;
        this.y = y;
        this.image = game.assets[imgsrc];
        this.imgsrc = imgsrc;
        this.scene = scene;
        this.scene.addChild(this);
    }
})

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
    this.PALETTE_OFFSET_X = map.x + map.width + 10;
    this.PALETTE_OFFSET_Y = 10;

    var paletteArray = [ADVANCE, BLANK, RIGHT, LEFT, BSTART, BEND, S_SPEAD, S_HEART, S_DIA, S_CLOVER, ARG];

    this.PALETTE_WIDTH = 76; /* img_size 32 * 2 + margin 4 * 3(left,center,right) */
    this.PALETTE_HEIGHT = Math.round(paletteArray.length / 2) * 36 + 4;
    var paletteBackground = new FillSquare(this.PALETTE_OFFSET_X - 4, this.PALETTE_OFFSET_Y - 4, this.PALETTE_WIDTH, this.PALETTE_HEIGHT);
    this.addChild(paletteBackground);


    /* editor zone */
    /* paletteArrayよりも下のレイヤに描画する必要があるため先に描画 */
    this.EDITOR_X = this.PALETTE_OFFSET_X + this.PALETTE_WIDTH + 24;
    this.EDITOR_Y = this.PALETTE_OFFSET_Y;
    this.BLOCK_SIZE = 32;
    this.EDITOR_PROGRAM_TOP = this.EDITOR_Y + this.BLOCK_SIZE;
    this.EDITOR_BLOCK_MARGIN = 4;
    this.BLOCK_NUM = 12;
    this.EDITOR_MARGIN = 16;
    this.FUNC_SYMBOL = [SPEAD, HEART, DIA, CLOVER];

    var editorBackground = new FillSquare(
        this.EDITOR_X - this.EDITOR_BLOCK_MARGIN,
        this.EDITOR_PROGRAM_TOP,
        this.BLOCK_SIZE + this.EDITOR_BLOCK_MARGIN * 2,
        this.BLOCK_NUM * this.BLOCK_SIZE + this.EDITOR_BLOCK_MARGIN * 2);
    this.addChild(editorBackground);

    this.mainProgramArray = [];
    this.funcProgramArray = []; /* 二次元配列 */

    /* main program */
    for (var i = 0; i < this.BLOCK_NUM; i++) {
        this.mainProgramArray[i] = new EditorBlock(this, 0, i, this.EDITOR_X, this.EDITOR_PROGRAM_TOP + this.EDITOR_BLOCK_MARGIN);
    }
    
    for (var j = 0; j < this.FUNC_SYMBOL.length; j++) {
        new DrawImage(this, this.EDITOR_X + (this.BLOCK_SIZE + this.EDITOR_MARGIN) * (j + 1), this.EDITOR_Y, this.BLOCK_SIZE, this.BLOCK_SIZE, this.FUNC_SYMBOL[j]);
        this.funcProgramArray[j] = [];
        for (var i = 0; i < this.BLOCK_NUM; i++) {
            this.funcProgramArray[j][i] = new EditorBlock(this, 1 + j, i, this.EDITOR_X, this.EDITOR_PROGRAM_TOP + this.EDITOR_BLOCK_MARGIN);
        }
    }

    // paletteArrayの中身に従ってblockを配置
    for (var index = 0; index < paletteArray.length; index++) {
        /* 横2列に1,2,\n 3,4,\n 5,6,...と配置する */
        var y = Math.floor(index / 2) * 36;
        var x = index % 2 == 0 ? 0:36;
        new PaletteBlock(this, x + this.PALETTE_OFFSET_X, y + this.PALETTE_OFFSET_Y, paletteArray[index]);
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
		    // var prog = new Program();
		    // var body = [
			// new TokenForward(),
			// new TokenRight(),
			// new TokenFuncall("hart"),
			// new TokenLoop(3),
			// new TokenBlockEnd(),
			// new TokenBlockEnd(),
			// new TokenParam(),
			// new TokenBlank(),
			// new TokenBlockEnd(),
			// new TokenLoop(3)
		    // ];
		    // if (prog.add("main", body) == false)
            // alert("invalid program");
            var prog = this.editScene.getProgram();
            if (prog !== undefined)
		        game.pushScene(new PlayScene(id, prog));
		});
	    },
	}))(this);
	this.addChild(playButton);
    },

    getBlockByIndex: function(index) {
        if (index < this.mainProgramArray.length) {
            return this.mainProgramArray[index];
        } else {
            var funcNum = Math.floor((index - this.mainProgramArray.length) / this.mainProgramArray.length);
            var funcIndex = index % this.mainProgramArray.length;
            return this.funcProgramArray[funcNum][funcIndex];
        }
    },

    getIndexByLocation: function(x,y) {
        /* location is in palette */
        if (x >= this.PALETTE_OFFSET_X - 4 &&
            x <= this.PALETTE_OFFSET_X + this.PALETTE_WIDTH &&
            y >= this.PALETTE_OFFSET_Y - 4 &&
            y <= this.PALETTE_OFFSET_Y + this.PALETTE_HEIGHT) {
            return PALETTE_ZONE;
        }

        /* out of range of y of program editor, cause fast return */
        if (!(y >= this.EDITOR_PROGRAM_TOP &&
            y <= this.EDITOR_PROGRAM_TOP + this.BLOCK_NUM * this.BLOCK_SIZE)) {
                return -1;
        }

        var index = (y - this.EDITOR_PROGRAM_TOP) / this.BLOCK_SIZE;

        /* in program line to edit main program */  
        if (x >= this.EDITOR_X &&
            x <= this.EDITOR_X + this.BLOCK_SIZE) {
            /* change new token */
            return index;
        } else {
            /* in program line to edit function program */
            for (var i = 0; i < this.FUNC_SYMBOL.length; i++) {
                if (x >= this.EDITOR_X + (this.BLOCK_SIZE + this.EDITOR_MARGIN) * (i + 1) &&
                    x <= this.EDITOR_X + (this.BLOCK_SIZE + this.EDITOR_MARGIN) * (i + 1) + this.BLOCK_SIZE) {
                    return (index + (i + 1) * this.mainProgramArray.length);
                }
            }
        }
        return -1;
    },

    insertBlock: function(index, block) {
        var funcNum = Math.floor(index / this.mainProgramArray.length);
        var targetIndex = Math.round(index) % this.mainProgramArray.length;
        if (funcNum == 0) {
            // mainProgramArray
            this.recursiveMoveBehindBlock(targetIndex + 1, this.mainProgramArray);
            this.mainProgramArray[targetIndex].changeBlock(block);
        } else {
            // funcProgramArray
            this.recursiveMoveBehindBlock(targetIndex + 1, this.funcProgramArray[funcNum - 1]);
            this.funcProgramArray[funcNum - 1][targetIndex].changeBlock(block);
        }
    },

    recursiveMoveBehindBlock: function(trueIndex, arrayProgram) {
        if (trueIndex + 1 < arrayProgram.length && arrayProgram[trueIndex].getBlockName() != BLANK) {
            this.recursiveMoveBehindBlock(trueIndex + 1, arrayProgram);
        }
        var blockName = arrayProgram[trueIndex - 1].getBlockName();
        var count = arrayProgram[trueIndex - 1].getCount();
        arrayProgram[trueIndex].replaceBlock(blockName, count);
    },

    /* block -> EditorBlock */
    /* blockName = [ADVANCE, BLANK, RIGHT, LEFT, BSTART, BEND, S_SPEAD, S_HEART, S_DIA, S_CLOVER, ARG] */
    tokenize: function(block) {
        switch(block.getBlockName()) {
            case ADVANCE:
                return new TokenForward();
                break;
            case BLANK:
                return new TokenBlank();
                break;
            case RIGHT:
                return new TokenRight();
                break;
            case LEFT:
                return new TokenLeft();
                break;
            case BSTART:
                return new TokenLoop(block.getCount());
                break;
            case BEND:
                return new TokenBlockEnd();
                break;
            case S_SPEAD:
                return new TokenFuncall("spead");
                break;
            case S_HEART:
                return new TokenFuncall("heart");
                break;
            case S_DIA:
                return new TokenFuncall("dia");
                break;
            case S_CLOVER:
                return new TokenFuncall("clover");
                break;
            case ARG:
                return new TokenParam();
                break;
        }
    },

    getBody: function(blockArray) {
        var tokenArray = new Array(blockArray.length);
        for (var i = 0; i < blockArray.length; i++) {
            tokenArray[i] = this.tokenize(blockArray[i]);
        }
        return tokenArray;
    },

    getProgram: function() {
        var program = new Program();
        if(!program.add(PROGRAM_MAIN, this.getBody(this.mainProgramArray))) {
            alert("invalid program");
            return undefined;
        };
        for (var i = 0; i < FUNC_NAME.length; i++) {
            if (!program.add(FUNC_NAME[i], this.getBody(this.funcProgramArray[i]))) {
                alert("invalid program");
                return undefined;
            }
        }
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