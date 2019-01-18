
const dummy = false;

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
    initialize: function(scene, frameView, index, offsetX, offsetY, imgsrc) {
        enchant.Sprite.call(this, 32, 32);
        this.scene = scene;
        this.frameView = frameView;
        var blockSize = 32;
        this.x = offsetX;
        this.y = offsetY + index * blockSize;
        this.image = game.assets[imgsrc];
        this.imgsrc = imgsrc;

        this.backgroundColor = "white";
        this.isHighlight = false;
        
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
    setHighlight: function(h) {
        if (h) {
            this.backgroundColor = "yellow";
        } else {
            this.backgroundColor = "white";
        }
    }
});

var FunctionFrameView = enchant.Class.create({
    initialize: function(scene, frameView, index, x, y, fname, tokens) {
        this.scene = scene;
        this.frameView = frameView;
        this.index = index;
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
        this.highlightBlocks = [];
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
            var block = new ExecBlock(this.scene, this, i, headX, headY, imgid);
            tokens[i].block = block;
            tokens[i].frameIndex = this.index;
            this.blocks.push(block);
        }
    },
    remove: function() {
        this.scene.removeChild(this.background);
        this.scene.removeChild(this.symbol);
        for (var i = 0; i < this.blocks.length; i++) {
            this.scene.removeChild(this.blocks[i]);
        }
    },
    addHighlightBlock: function(block) {
        block.setHighlight(true);
        this.highlightBlocks.push(block);
    },
    removeHighlightBlock: function() {
        var block = this.highlightBlocks.pop();
        if (block != undefined) block.setHighlight(false);
    },
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
        this.frameViewList.push(new FunctionFrameView(this.scene, this, 0, x, y, "main", tokens));

        this.highlightInfoStack = [];
        this.prevHighlightedToken = undefined;
    },
    pushFunctionFrame: function(fname, tokens) {
        var prevFrame = this.frameViewList[this.frameViewList.length - 1];
        var newFrameViewPosX = prevFrame.x + prevFrame.width + this.DIST_BITWEEN_FRAMES;
        var newFrameViewPosY = this.y;
        this.frameViewList.push(new FunctionFrameView(
            this.scene,
            this,
            this.frameViewList.length, // 作るframeのindex番号
            newFrameViewPosX,
            newFrameViewPosY,
            fname,
            tokens
            ));
    },
    pop: function() {
        var poped = this.frameViewList.pop();
        poped.remove();
    },
    remove: function() {
        for (var i = 0; i < this.frameViewList.length; i++) {
            this.frameViewList[i].remove();
        }
    },
    setHighlight: function(token) {
        // 基本的には，前回の呼び出しで与えられたtokenのハイライトを消し，
        // 今回の呼び出しで与えられたtokenをハイライトする

        // ただし，Paramはその実引数の実行が終わるまで，
        // Funcallは呼び出した関数がリターンするまでハイライトしなければならない
        // このあたりはhighlightInfoStackで管理する．

        // 前回のtokenのハイライトを消す
        if (this.prevHighlightedToken != undefined) {
            this.prevHighlightedToken.block.setHighlight(false);
            this.prevHighlightedToken = undefined;
        }

        var currentFrameIndex = this.frameViewList.length - 1;

        // ParamとFuncallのハイライトを消すべきならば消す
        if (this.highlightInfoStack.length != 0) {
            var top = this.highlightInfoStack[this.highlightInfoStack.length - 1];
            switch (top.token.type) {
                case "Param": {
                    if (token.frameIndex == currentFrameIndex) {
                        console.log("top: unhighlight:"+top.token.type);
                        top.token.block.setHighlight(false);
                        this.highlightInfoStack.pop();
                    }
                } break;
                case "Funcall": {
                    if (top.frameIndex == currentFrameIndex) {
                        top.token.block.setHighlight(false);
                        this.highlightInfoStack.pop();
                    }
                } break;
                default: 
                    console.assert("highlightInfoStack: unexpected token type: "+top.token.type);
            }
        }

        // ParamとFuncallはhighlightInfoStackにpushしてハイライト
        // 他はprevHighlightedTokenに記録&ハイライト
        switch (token.type) {
            case "Param": {
                this.highlightInfoStack.push({
                    token: token,
                    frameIndex: currentFrameIndex,
                });
                token.block.setHighlight(true);
            } break;
            case "Funcall": {
                this.highlightInfoStack.push({
                    token: token,
                    frameIndex: currentFrameIndex,
                });
                token.block.setHighlight(true);
            } break;
            case "Blank": 
            case "Forward":
            case "Left":
            case "Right":
            case "Loop":
            case "End": {
                token.block.setHighlight(true);
                this.prevHighlightedToken = token;
            } break;
            default: {
                console.assert("highlight: unexpected token type: "+token.type);
            }
        }
    },
});

var PlayScene = enchant.Class.create(enchant.Scene, {
    initialize: function(mapId, program) {
        enchant.Scene.call(this);
        this.backgroundColor = "white";

        var map = game.createMap(mapId);
        this.map = map;
        this.addChild(map);

        this.program = program;

        this.autoPlaying = false;
        this.programHasFinished = false;

        this.autoPlayingInterval = 1000;
        this.controlPanelOffsetX = 32;
        this.controlPanelOffsetY = map.y + map.height + 32;
        this.initControlPanel();

        var playScene = this;
        this.callbacks = {
            highlight: function(token) {
                //playScene.frameListView.setHighlight(token.block);
                //token.block.setHighlight(true);
                
                playScene.frameListView.setHighlight(token);
            },
            forward: function() {
                var nextX, nextY;
                switch (playScene.playerState.direction) {
                    case PLAYER_DIRECTION_UP: {
                        nextX = playScene.playerState.x;
                        nextY = playScene.playerState.y - 1;
                    } break;
                    case PLAYER_DIRECTION_DOWN: {
                        nextX = playScene.playerState.x;
                        nextY = playScene.playerState.y + 1;
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

                if (map.hitTest(nextX*MAP_BLOCK_SIZE, nextY*MAP_BLOCK_SIZE)) {
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
                //frameListView.pushFunctionFrame(fname, program.get(fname));
            },
            pushVisibleFrame: function() {
                var code = playScene.engine.currentFrame.code;
                var fname = playScene.engine.currentFrame.name;
                playScene.frameListView.pushFunctionFrame(fname, code);
            },
            popVisibleFrame: function() {
                playScene.frameListView.pop();
            },
            initToken: function(token, i) {
                //token.index = i;
            },
        }

        this.programHasFinished = false;
        this.autoPlaying = false;
        this.init();
    },
    execNextStep: function() {
        if (this.engine.step()) {
            setTimeout(function() {
                if (this.autoPlaying) {
                    this.execNextStep();
                }
            }.bind(this), this.autoPlayingInterval);
        } else {
            this.autoPlaying = false;
            this.programHasFinished = true;
            this.updateControlPanel();
        }
    },
    initControlPanel: function() {		
        var playScene = this;

        // back to the edit scene
        var btnEdit = new Button("Edit");
        btnEdit.x = this.controlPanelOffsetX;
        btnEdit.y = this.controlPanelOffsetY;
        btnEdit.addEventListener("touchstart", function() {
            game.popScene();
        });
        this.addChild(btnEdit);


        // initialize player position
        var btnInit = new Button("Init");
        btnInit.x = this.controlPanelOffsetX + 64;
        btnInit.y = this.controlPanelOffsetY;
        btnInit.addEventListener("touchstart", function() {
            playScene.programHasFinished = false;
            playScene.autoPlaying = false;
            playScene.init();
        });
        this.addChild(btnInit);
        this.btnInit = btnInit;


        // start/stop for auto playing
        var btnPlay = new Button("Play");
        var btnStop = new Button("Stop");

        btnPlay.x = this.controlPanelOffsetX + 64*2;
        btnPlay.y = this.controlPanelOffsetY;
        btnPlay.addEventListener("touchstart", function() {
            playScene.autoPlaying = true;
            if (playScene.programHasFinished) {
                playScene.programHasFinished = false;
                playScene.init();
            }
            playScene.updateControlPanel();
            
            // execute program
            setTimeout(function() {
                playScene.execNextStep();
            }, playScene.autoPlayingInterval);
        });
        this.addChild(btnPlay);

        btnStop.x = this.controlPanelOffsetX + 64*2;
        btnStop.y = this.controlPanelOffsetY;
        btnStop.addEventListener("touchstart", function() {
            playScene.autoPlaying = false;
            playScene.updateControlPanel();
        });
        this.addChild(btnStop);

        this.btnEdit = btnEdit;
        this.btnPlay = btnPlay;
        this.btnStop = btnStop;


        // Next step
        var btnNext = new Button("Next");
        btnNext.x = this.controlPanelOffsetX + 64*3;
        btnNext.y = this.controlPanelOffsetY;
        btnNext.addEventListener("touchstart", function() {
            playScene.execNextStep();
        });
        this.addChild(btnNext);
        this.btnNext = btnNext;
        
        
        playScene.updateControlPanel();
    },

    updateControlPanel: function() {
        this.btnPlay.visible = !this.autoPlaying;
        this.btnPlay.touchEnabled = !this.autoPlaying;
        this.btnStop.visible = this.autoPlaying;
        this.btnStop.touchEnabled = this.autoPlaying;

        this.btnInit.visible = !this.autoPlaying;
        this.btnInit.touchEnabled = !this.autoPlaying;

        this.btnNext.visible = !this.programHasFinished && !this.autoPlaying;
        this.btnNext.touchEnabled = !this.programHasFinished && !this.autoPlaying;
    },

    init: function() {
        var map = this.map;

        if (this.player !== undefined) this.removeChild(this.player);
        this.player = new Player(map.init_x, map.init_y, map.init_direction);
        this.addChild(this.player);

        if (this.goal !== undefined) this.removeChild(this.goal);
        this.goal = new Goal(map.goal_x, map.goal_y);
        this.addChild(this.goal);

        

        this.playerState = {
            x: map.init_x,
            y: map.init_y,
            direction: map.init_direction,
        };
        
        this.engine = new Interp(this.program, this.callbacks);
        var mainCode = this.engine.getCurrentFrameCode();
        if (this.frameListView !== undefined) this.frameListView.remove();
        this.frameListView = new FrameListView(this,
            map.x + map.width + 10,
            16,
            mainCode);

        this.updateControlPanel();
    },

});
