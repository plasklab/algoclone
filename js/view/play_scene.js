
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

const HIGHLIGHT_NONE = 0;
const HIGHLIGHT_ON_1 = 1;
const HIGHLIGHT_ON_2 = 2;

var ExecBlock = enchant.Class.create(enchant.Group, {
    initialize: function(scene, frameView, index, imgsrc) {
        enchant.Group.call(this);

        this.scene = scene;
        this.frameView = frameView;
        this.index = index;
        this.imgsrc = imgsrc;

        this.width = 32;
        this.height = 32;

        this.blockImg = new enchant.Sprite(32, 32);
        this.blockImg.image = game.assets[imgsrc];
        this.addChild(this.blockImg);
        
        this.highlight = new enchant.Sprite(32, 32);
        this.highlight.visible = false;
        this.addChild(this.highlight);

        this.scene.addChild(this);
    },
    
    getBlockName: function() {
        return this.imgsrc;
    },

    setHighlight: function(val) {
        switch (val) {
        case HIGHLIGHT_NONE:
            this.highlight.backgroundColor = "white";
            this.highlight.visible = false;
            break;
        case HIGHLIGHT_ON_1:
            this.highlight.backgroundColor = "yellow";
            this.highlight.visible = true;
            this.highlight.opacity = 0.5;
            break;
        case HIGHLIGHT_ON_2:
            this.highlight.backgroundColor = "#CCCC00";
            this.highlight.visible = true;
            this.highlight.opacity = 0.5;
            break;
        }
    },

    setVisible: function(on) {
        this.blockImg.visible = on;
    },
});

var FunctionFrameView = enchant.Class.create({
    initialize: function(scene, frameView, index, x, y, fname, tokens, numOfDisplayBlocks) {
        this.scene = scene;
        this.frameView = frameView;
        this.index = index;
        this.x = x;
        this.y = y;
        this.fname = fname;
        this.numOfDisplayBlocks = numOfDisplayBlocks;
        this.width = frameView.BLOCK_SIZE + frameView.MARGIN * 2;
        this.bodyY = y + frameView.MARGIN + frameView.BLOCK_SIZE;
        this.bodyHeight = this.numOfDisplayBlocks * frameView.BLOCK_SIZE + frameView.MARGIN * 2;
        this.background = new FillSquare(
            x,
            this.bodyY,
            this.width,
            this.bodyHeight,
        );
        this.prevFocusedBlockIndex = 0;

        scene.addChild(this.background);

        if (fname == undefined) { // Argframe
        } else if (fname != "main") { // Function
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

        this.loadTokens(tokens);
        this.currentHeadBlockIndex = 0;
        this.display();
    },
    loadTokens: function(tokens) {
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
            var block = new ExecBlock(this.scene, this, i, imgid);
            tokens[i].block = block;
            tokens[i].index = i;
            tokens[i].frameIndex = this.index;
            tokens[i].frameView = this;
            block.visible = false;
            this.blocks.push(block);
        }
    },
    display: function() {
        var headX = this.x + this.frameView.MARGIN;
        var headY = this.bodyY + this.frameView.MARGIN;
        var blockSize = 32;
        var blockIndex = 0;
        for (; blockIndex < this.currentHeadBlockIndex; blockIndex++) {
            this.blocks[blockIndex].setVisible(false);
        }
        for (var i = 0; i < this.numOfDisplayBlocks && i < this.blocks.length; i++, blockIndex++) {
            var x = headX;
            var y = headY + i * blockSize;
            this.blocks[blockIndex].x = x;
            this.blocks[blockIndex].y = y;
            this.blocks[blockIndex].setVisible(true);
        }
        for (; blockIndex < this.blocks.length; blockIndex++) {
            this.blocks[blockIndex].setVisible(false);
        }
    },
    focusBlock: function(index) {
        var MARGIN = 2;
        var indexOnView = index - this.currentHeadBlockIndex;
        if (indexOnView < MARGIN) {
            if (index < MARGIN) this.currentHeadBlockIndex = 0;
            else this.currentHeadBlockIndex = index - MARGIN;
        } else if (indexOnView >= this.numOfDisplayBlocks - MARGIN) {
            if (index >= this.blocks.length - MARGIN) {
                this.currentHeadBlockIndex = this.blocks.length - this.numOfDisplayBlocks;
            } else {
                this.currentHeadBlockIndex = index - this.numOfDisplayBlocks + 1 + MARGIN;
            }
        }
        this.display();
    },
    remove: function() {
        this.scene.removeChild(this.background);
        this.scene.removeChild(this.symbol);
        for (var i = 0; i < this.blocks.length; i++) {
            this.scene.removeChild(this.blocks[i]);
        }
    },
});

var FrameListView = enchant.Class.create({
    initialize: function(scene, x, y, tokens, maxLength) {
        this.scene = scene;

        this.x = x;
        this.y = y;

        this.MARGIN = 4;
        this.BLOCK_SIZE = 32;
        this.BLOCK_NUM = 12;
        this.DIST_BITWEEN_FRAMES = 8;

        this.numOfDisplayBlocks = maxLength;

        this.frameViewList = [];
        this.frameViewList.push(new FunctionFrameView(this.scene, this, 0, x, y, "main", tokens, this.numOfDisplayBlocks));

        this.shouldPopHighlightInfoStack = true;
        this.highlightInfoStack = [];
        this.highlightInfoStack.top = function() {
            if (this.length == 0) return undefined;
            return this[this.length-1];
        };
    },
    pushFunctionFrame: function(fname, tokens) {
        // if (fname == undefined) -> ArgFrame, otherwise FunctionFrame
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
            tokens,
            this.numOfDisplayBlocks,
        ));
        this.shouldPopHighlightInfoStack = false;
    },
    pop: function() {
        var poped = this.frameViewList.pop();
        poped.remove();
        if (poped.fname == undefined) {// 消す対象がArgFrameのとき
            var highlightInfo = this.highlightInfoStack.top();
            if (highlightInfo != undefined) {
                highlightInfo.token.block.setHighlight(HIGHLIGHT_NONE);
            }
            return;
        } else { // 消す対象がFunctionFrameのとき highlightInfoから関数をpopするまでpopし続ける
            while (true) {
                var highlightInfo = this.highlightInfoStack.top();
                if (highlightInfo == undefined) break; // mainが終わったらundefinedになる
                if (highlightInfo.frameIndex == this.frameViewList.length-1) {
                    highlightInfo.token.block.setHighlight(HIGHLIGHT_ON_1);
                    break;
                }
                highlightInfo.token.block.setHighlight(HIGHLIGHT_NONE);
                this.highlightInfoStack.pop();
            }
        }
        this.shouldPopHighlightInfoStack = true;
    },
    remove: function() {
        for (var i = 0; i < this.frameViewList.length; i++) {
            this.frameViewList[i].remove();
        }
    },

    setHighlight: function(token) {
        var currentFrameIndex = this.frameViewList.length - 1;
        var highlightInfo = {
            token: token,
            frameIndex: currentFrameIndex,
        };

        var top = this.highlightInfoStack.top();
        if (top != undefined) {
            if (this.shouldPopHighlightInfoStack) {
                top.token.block.setHighlight(HIGHLIGHT_NONE);
                this.highlightInfoStack.pop();
            } else {
                top.token.block.setHighlight(HIGHLIGHT_ON_2);
            }
        }

        var top = this.highlightInfoStack.top();
        if (top != undefined) {
            if (top.token.type == "Param" && top.frameIndex == token.frameIndex) {
                top.token.block.setHighlight(HIGHLIGHT_NONE);
                this.highlightInfoStack.pop();
            }
        }

        if (token.type == "Param") {
            this.shouldPopHighlightInfoStack = false;
        } else {
            this.shouldPopHighlightInfoStack = true;
        }

        token.block.setHighlight(HIGHLIGHT_ON_1);
        this.highlightInfoStack.push(highlightInfo);

        token.frameView.focusBlock(token.index);
        console.log(token.block);
    },
});

var PlayScene = enchant.Class.create(enchant.Scene, {
    initialize: function(mapId, program) {
        enchant.Scene.call(this);
        this.backgroundColor = "white";
        this.program = program;

        // 状態
        this.autoPlaying = true;
        this.programHasFinished = false;
        this.interrupted = false;

        // mapを表示する場所&大きさ
        var mapSpace = { x: 0, y: 0, width: 20, height: 16 };
        this.mapSpace = mapSpace;

        // 自動実行時の各ステップの間隔（ms）
        this.autoPlayingInterval = 500;

        // 操作ボタンの場所の基準
        this.controlPanelOffset = { x: 32, y: mapSpace.y + (mapSpace.height*MAP_TILE_SIZE) + 32 };
        this.initControlPanel();
        
        // 取得コインの数を表示する場所
        this.posNumberOfCoins = { x: 32, y: this.controlPanelOffset.y+64 };
        this.initCoinNumberLabel();

        // 実行中ブロックリストの長さ
        this.maxLengthOfFrameList = 12;

        var playScene = this;
        this.callbacks = {
            highlight: function(token) {
                playScene.frameListView.setHighlight(token);
            },
            forward: function() {
                if (playScene.map.player.moveForward()) {
                    var x = playScene.map.player.x;
                    var y = playScene.map.player.y;
                    switch (playScene.map.getGem(x, y)) {
                    case 0: // COIN
                    {
                        playScene.map.setGem(x, y, -1);
                        playScene.numOfCoinsAcquired++;
                        playScene.updateCoinNumber();
                        break;
                    }
                    case -1: break;
                    }
                    playScene.map.redraw();
                    if (playScene.map.isPlayerInGoalPoint()) {
                        // clear.
                        playScene.gameClear();
                    }
                } else {
                    // Game over.
                    playScene.gameFailed();
                }
            },
            right: function() {
                playScene.map.player.rotateRight();
                playScene.map.redraw();
            },
            left: function() {
                playScene.map.player.rotateLeft();
                playScene.map.redraw();
            },
            funcall: function(fname) {
                //frameListView.pushFunctionFrame(fname, program.get(fname));
            },
            pushVisibleFrame: function() {
                var currentFrame = playScene.engine.currentFrame;
                var code = currentFrame.code;
                if (currentFrame.type == "FunctionFrame") {
                    var fname = currentFrame.name;
                    playScene.frameListView.pushFunctionFrame(fname, code);
                } else if (playScene.engine.currentFrame.type == "ArgFrame") {
                    playScene.frameListView.pushFunctionFrame(undefined, code);
                }
            },
            popVisibleFrame: function() {
                playScene.frameListView.pop();
            },
            initToken: function(token, i) {
            },
        }

        // 初期化，実行
        this.init();
        if (this.autoPlaying) {
            setTimeout(function() {
                if (this.autoPlaying) {
                    this.execNextStep();
                }
            }.bind(this), this.autoPlayingInterval);
        }
    },
    execNextStep: function() {
        if (!this.interrupted && !this.programHasFinished) {
            if (this.engine.step()) {
                setTimeout(function() {
                    if (this.autoPlaying) {
                        this.execNextStep();
                    }
                }.bind(this), this.autoPlayingInterval);
            } else {
                // 実行終了
                this.end();
            }
        }
    },
    initControlPanel: function() {
        var playScene = this;

        // back to the edit scene
        var btnEdit = new Button("Edit");
        btnEdit.x = this.controlPanelOffset.x;
        btnEdit.y = this.controlPanelOffset.y;
        btnEdit.addEventListener("touchstart", function() {
            game.popScene();
            playScene.interrupted = true;
        });
        this.addChild(btnEdit);


        // initialize player position
        var btnInit = new Button("Init");
        btnInit.x = this.controlPanelOffset.x + 64;
        btnInit.y = this.controlPanelOffset.y;
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

        btnPlay.x = this.controlPanelOffset.x + 64*2;
        btnPlay.y = this.controlPanelOffset.y;
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

        btnStop.x = this.controlPanelOffset.x + 64*2;
        btnStop.y = this.controlPanelOffset.y;
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
        btnNext.x = this.controlPanelOffset.x + 64*3;
        btnNext.y = this.controlPanelOffset.y;
        btnNext.addEventListener("touchstart", function() {
            playScene.execNextStep();
        });
        this.addChild(btnNext);
        this.btnNext = btnNext;

        this.controlPanelWidth = 64*4;
        
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

    initCoinNumberLabel: function() {
        this.labelNumOfCoins = new Label();
        this.labelNumOfCoins.x = this.posNumberOfCoins.x;
        this.labelNumOfCoins.y = this.posNumberOfCoins.y;
        this.labelNumOfCoins.color = "red";
        this.labelNumOfCoins.font = "64px monospace";
        this.addChild(this.labelNumOfCoins);
    },

    init: function() {
        // 状態
        this.numOfCoinsAcquired = 0;

        var map = getInitializedMap(this, this.mapSpace);
        this.map = map;
        
        this.engine = new Interp(this.program, this.callbacks);

        var mainCode = this.engine.getCurrentFrameCode();

        if (this.frameListView !== undefined) this.frameListView.remove();
        var xPosOfFrameListView1 = map.x + map.width + 10;
        var xPosOfFrameListView2 = this.controlPanelOffset.x + this.controlPanelWidth + 10;
        this.frameListView = new FrameListView(this,
            (xPosOfFrameListView1 > xPosOfFrameListView2) ? xPosOfFrameListView1 : xPosOfFrameListView2,
            16,
            mainCode,
            this.maxLengthOfFrameList);

        this.updateControlPanel();
        this.updateCoinNumber();
    },

    end: function() {
        if (this.map.isPlayerInGoalPoint()) {
            this.gameClear();
        } else {
            this.gameFailed();
        }
    },

    gameClear: function() {
        var playScene = this;
        var gameClearScene = new Scene();
        var clearImg = new Sprite(267, 48);
        clearImg.x = 267; clearImg.y = 48;
        clearImg.scaleX = 2;
        clearImg.scaleY = 2;
        clearImg.image = game.assets[CLEAR];
        gameClearScene.addChild(clearImg);
        playScene.programHasFinished = true;
        gameClearScene.addEventListener("touchstart", function() {
            game.popScene();
            playScene.autoPlaying = false;
            playScene.updateControlPanel();
        });
        game.pushScene(gameClearScene);
    },

    gameFailed: function() {
        var playScene = this;
        var gameOverScene = new Scene();
        var gameOverImg = new Sprite(189, 97);
        gameOverImg.x = 189; gameOverImg.y = 97;
        gameOverImg.scaleX = 2;
        gameOverImg.scaleY = 2;
        gameOverImg.image = game.assets[GAMEOVER];
        gameOverScene.addChild(gameOverImg);
        playScene.programHasFinished = true;
        gameOverScene.addEventListener("touchstart", function() {
            game.popScene();
            playScene.autoPlaying = false;
            playScene.updateControlPanel();
        });
        game.pushScene(gameOverScene);
    },

    updateCoinNumber: function() {
        this.labelNumOfCoins.text = this.numOfCoinsAcquired;
    },

});

var getInitializedMap = function(scene, mapSpace) {
    var mapData = maps[0];
    var map = new ScrollMap(mapData, MAP, [COIN]);
    //map.setOrigin(0, 0);
    map.place(scene, mapSpace.x, mapSpace.y, mapSpace.width, mapSpace.height);
    return map;
};

/* Local Variables: */
/* indent-tabs-mode: nil */
/* End: */
