
const dummy = true;

if (dummy) {
	Interp = enchant.Class.create({
		initialize: function(program, callbacks) {
			this.program = program;
			this.callbacks = callbacks;

			this.program = [
				new TokenForward(),
				new TokenLeft(),
				new TokenRight(),
				new TokenFuncall("spead"),
				//new TokenParam(),
			];
			this.i = 0;
		},
		step: function() {
			if (this.i < this.program.length) {
				switch (this.program[this.i].type) {
					case "Forward": this.callbacks.forward(this.program[this.i]); break;
					case "Left": this.callbacks.left(this.program[this.i]); break;
					case "Right": this.callbacks.right(this.program[this.i]); break;
					case "Funcall": this.callbacks.funcall(this.program[this.i].name); break;
					default: console.log("DUMMY ERROR:"+this.program[this.i].type); break;
				}
				this.i++;
				return true;
			} else {
				return false;
			}
		},
	});
}

debugprint = function(s) {
	console.log("play scene: "+s);
};

var ExecBlock = enchant.Class.create(enchant.Sprite, {
    initialize: function(scene, index, offsetX, offsetY, imgsrc) {
        enchant.Sprite.call(this, 32, 32);
        this.scene = scene;
        var blockSize = 32;
        this.x = offsetX;
		this.y = offsetY + index * blockSize;
		this.image = game.assets[imgsrc];
		this.imgsrc = imgsrc;
		
		this.scene.addChild(this);
    },
    getBlockName: function() {
        return this.imgsrc;
	},
	/*
    getCount: function() {
        if (this.imgsrc == BSTART) {
            return parseInt(this.countLabel.text);
        } else {
            return 0;
        }
    }*/
});

var FunctionFrameView = enchant.Class.create({
	initialize: function(scene, frameView, x, y, fname, tokens) {
		this.scene = scene;
		this.frameView = frameView;
		this.x = x;
		this.y = y;
		this.width = frameView.BLOCK_SIZE + frameView.MARGIN * 2;
		this.bodyY = y + frameView.MARGIN + frameView.BLOCK_SIZE;
		this.bodyHeight = frameView.BLOCK_NUM * frameView.BLOCK_SIZE + frameView.MARGIN * 2;
		this.background = new FillSquare(
			x,
			this.bodyY,
			this.width,
			this.bodyHeight,
		);

		scene.addChild(this.background);

		if (fname != "main") {
			var symX = this.x + this.frameView.MARGIN;
			var symY = this.y;
			var symImg = undefined;
			switch (fname) {
				case "spead":   symImg = SPEAD; break;
				case "heart":   symImg = HEART; break;
				case "dia":     symImg = DIA; break;
				case "clover":  symImg = CLOVER; break;
				default: console.log("unknown function name: "+fname);
			}
			this.symbol = new DrawImage(this.scene,
				symX, symY,
				frameView.BLOCK_SIZE, frameView.BLOCK_SIZE, symImg);
			this.scene.addChild(this.symbol);
		}
		this.displayBlocks(tokens);
	},
	displayBlocks: function(tokens) {
		var headX = this.x + this.frameView.MARGIN;
		var headY = this.bodyY + this.frameView.MARGIN;
		this.blocks = [];

		//[ADVANCE, BLANK, RIGHT, LEFT, BSTART, BEND, S_SPEAD, S_HEART, S_DIA, S_CLOVER, ARG];
		for (var i = 0; i < tokens.length; i++) {
			var imgid = undefined;
			switch (tokens[i].type) {
				case "Forward": imgid = ADVANCE; break;
				case "Left": imgid = LEFT; break;
				case "Right": imgid = RIGHT; break;
				case "Param": imgid = ARG; break;
				case "Loop": imgid = BSTART; break;
				case "End": imgid = BEND; break;
				case "Funcall": {
					switch (tokens[i].name) {
						case "spead": imgid = S_SPEAD; break;
						case "heart": imgid = S_HEART; break;
						case "dia":   imgid = S_DIA; break;
						case "clover":imgid = S_CLOVER; break;
						default: console.log("unknown function name: "+tokens[i].name);
					}
				} break;
				case "Blank": imgid = BLANK; break;
				default: debugprint("INVALID TOKEN: "+tokens[i]);
			}
			this.blocks.push(new ExecBlock(this.scene, i, headX, headY, imgid));
		}
	},
	delete: function() {
		this.scene.removeChild(this.background);
		this.scene.removeChild(this.symbol);
		for (var i = 0; i < this.blocks.length; i++) {
			this.scene.removeChild(this.blocks[i]);
		}
	}
});

var FrameListView = enchant.Class.create({
	initialize: function(scene, x, y, tokens) {
		this.scene = scene;

		this.x = x;
		this.y = y;

		this.MARGIN = 4;
		this.BLOCK_SIZE = 32;
		this.BLOCK_NUM = 12;
		this.DIST_BITWEEN_FRAMES = 8;

		this.frameViewList = [];
		this.frameViewList.push(new FunctionFrameView(this.scene, this, x, y, "main", tokens));
	},
	pushFunctionFrame: function(fname, tokens) {
		var prevFrame = this.frameViewList[this.frameViewList.length - 1];
		var newFrameViewPosX = prevFrame.x + prevFrame.width + this.DIST_BITWEEN_FRAMES;
		var newFrameViewPosY = this.y;
		this.frameViewList.push(new FunctionFrameView(
			this.scene,
			this,
			newFrameViewPosX,
			newFrameViewPosY,
			fname,
			tokens
			));
	},
	pop: function() {
		var poped = this.frameViewList.pop();
		poped.delete();
	}
});

var PlayScene = enchant.Class.create(enchant.Scene, {
    initialize: function(mapId, program) {
		enchant.Scene.call(this);
		this.backgroundColor = "white";

		var map = game.createMap(mapId);
		this.map = map;
		this.addChild(map);

		var btnEdit = new Button("Edit");
		btnEdit.x = 32;
		btnEdit.y = map.y + map.height + 10;
		btnEdit.addEventListener("touchstart", function() {
			game.popScene();
		});
		this.addChild(btnEdit);

		var player = new Player(map.init_x, map.init_y, map.init_direction);
		this.player = player;
		this.addChild(this.player);
		var playerState = {
			x: map.init_x,
			y: map.init_y,
			direction: map.init_direction,
		};
		this.playerState = playerState;

		this.goal = new Goal(map.goal_x, map.goal_y);
		this.addChild(this.goal);


		var frameListView = new FrameListView(this,
			map.x + map.width + 10,
			16,
			program.get("main"));
		this.frameListView = frameListView;



		var playScene = this;
		var engine = new Interp(program, {
			highlight: function(token) {
				console.log("highlight: "+token.type);
			},
			forward: function() {
				var nextX, nextY;
				switch (playScene.playerState.direction) {
					case PLAYER_DIRECTION_UP: {
						nextX = playScene.playerState.x;
						nextY = playScene.playerState.y - 1;
					} break;
					case PLAYER_DIRECTION_DOWN: {
						nextX = playScene.playerState.x + 1;
						nextY = playScene.playerState.y;
					} break;
					case PLAYER_DIRECTION_LEFT: {
						nextX = playScene.playerState.x - 1;
						nextY = playScene.playerState.y;
					} break;
					case PLAYER_DIRECTION_RIGHT: {
						nextX = playScene.playerState.x + 1;
						nextY = playScene.playerState.y;
					} break;
					default: {
						debugprint("forward: unknown direction: "+playScene.playerState.direction);
					}
				}

				const mapBlockSize = 16;
				if (map.hitTest(nextX*mapBlockSize, nextY*mapBlockSize)) {
					console.log("GameOver");
				} else {
					playScene.player.moveForward();
					playScene.playerState.x = nextX;
					playScene.playerState.y = nextY;
				}
			},
			right: function() {
				var d = undefined;
				switch (playScene.playerState.direction) {
					case PLAYER_DIRECTION_UP: {
						d = PLAYER_DIRECTION_RIGHT;
					} break;
					case PLAYER_DIRECTION_DOWN: {
						d = PLAYER_DIRECTION_LEFT;
					} break;
					case PLAYER_DIRECTION_LEFT: {
						d = PLAYER_DIRECTION_UP
					} break;
					case PLAYER_DIRECTION_RIGHT: {
						d = PLAYER_DIRECTION_DOWN;
					} break;
					default: debugprint("right: unknown direction: "+playScene.playerState.direction);
				}
				playScene.player.setDirection(d);
				playScene.playerState.direction = d;
			},
			left: function() {
				var d = undefined;
				switch (playScene.playerState.direction) {
					case PLAYER_DIRECTION_UP: {
						d = PLAYER_DIRECTION_LEFT;
					} break;
					case PLAYER_DIRECTION_DOWN: {
						d = PLAYER_DIRECTION_RIGHT;
					} break;
					case PLAYER_DIRECTION_LEFT: {
						d = PLAYER_DIRECTION_DOWN;
					} break;
					case PLAYER_DIRECTION_RIGHT: {
						d = PLAYER_DIRECTION_UP;
					} break;
					default: debugprint("left: unknown direction: "+playScene.playerState.direction);
				}
				playScene.player.setDirection(d);
				playScene.playerState.direction = d;
			},
			funcall: function(fname) {
				frameListView.pushFunctionFrame(fname, program.get(fname));
			},
		});
		this.engine = engine;

		// execute program
		setTimeout(function() {
			this.execNextStep();
		}.bind(this), 1000);
	},
	execNextStep: function() {
		if (this.engine.step()) {
			setTimeout(function() {
				this.execNextStep();
			}.bind(this), 1000);
		}
	},

});
