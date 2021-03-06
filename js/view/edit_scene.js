const BLOCK_SIZE = 32;

const PROGRAM_MAIN = "main";
const PALETTE_ZONE = "palette zone";
const PROGRAM_ZONE = "program zone";
const SCROLL_ZONE  = "scroll zone";
const FUNC_NAME = ["main", "spead", "heart", "dia", "clover"];

const MODE_IN_PALETTE   = "mode in palette";
const MODE_FROM_PALETTE = "mode from palette";
const MODE_IN_PROGRAM   = "mode in program";
const MODE_FROM_PROGRAM = "mode from program";

const ACTION_INSERT_BEFORE = "insert before";
const ACTION_INSERT_AFTER  = "insert after";
const ACTION_PUT           = "put"
const ACTION_UNDO          = "undo"
const EDIT_INSERT_BLOCK_EDGE = 8;
const AFTER_BLOCK   = "after block";
const REPLACE_BLOCK = "replace block";
const NO_HIGHLIGHT  = "no highlight";
const INSERT_OFFSET = 16;

/*
    内部的なプログラム : edittingProgram
    内部的な各関数のコード : code
    codeのインデックス : codeIndex
    ユーザに見えるプログラム : visibleProgram
    ユーザに見える各関数のコード : visibleCode
    visibleCodeのインデックス : viewIndex
    ユーザに見えるcodeの範囲 : visibleTop ... visibleBottom
    codeIndex ---> viewIndex : codeToViewIndex(funcNo, codeIndex)
    viewIndex ---> codeIndex : viewToCodeIndex(funcNo, viewIndex)
*/

// index in EditorBlock is codeIndex;
var EditorBlock = enchant.Class.create(enchant.Group, {
    initialize: function(scene, x, y, imgsrc, token) {
        enchant.Group.call(this);
        this.x = x;
        this.y = y;
        this.imgsrc = imgsrc;
        this.token = token;

        var mainSprite = new enchant.Sprite(BLOCK_SIZE, BLOCK_SIZE);
        mainSprite.x = 0;
        mainSprite.y = 0;
        mainSprite.image = game.assets[imgsrc];
        this.addChild(mainSprite);

        this.mode = MODE_IN_PALETTE;
        this.clkOffX = 0;
        this.clkOffY = 0;
        this.positionInProgram = undefined;

        this.addEventListener("touchmove", function(e) {
            if (this.mode == MODE_FROM_PALETTE ||
                this.mode == MODE_FROM_PROGRAM) {
                this.x = e.x - this.clkOffX;
                this.y = e.y - this.clkOffY;
                this.scene.highlightLocation(this.getCenter().x,this.getCenter().y);
            }
        });

        this.addEventListener("touchend", function(e) {
            if (this.mode == MODE_FROM_PALETTE ||
                this.mode == MODE_FROM_PROGRAM) {
                this.scene.dropBlock(this,
                                     this.getCenter().x,
                                     this.getCenter().y);
            }
        });

        this.addEventListener("touchstart", function(e) {
            if (e.done)
                return;
            console.log("touchstart base");
            if (this.mode == MODE_IN_PALETTE) {
                this.mode = MODE_FROM_PALETTE;
                var b = this.clone();
                this.scene.insertBefore(this, this.scene.highlightAtDrop);
                this.scene.insertBefore(b, this);
            } else if (this.mode == MODE_IN_PROGRAM) {
                this.mode = MODE_FROM_PROGRAM;
                this.scene.insertBefore(this, this.scene.highlightAtDrop);
            }
            this.clkOffX = e.x - this.x;
            this.clkOffY = e.y - this.y;
        });

        scene.addChild(this);
    },

    clone: function() {
        return new EditorBlock(this.scene,
                               this.x, this.y, this.imgsrc, this.token);
    },

    getCenter: function() {
        return {x: this.x + BLOCK_SIZE / 2,
                y: this.y + BLOCK_SIZE / 2};
    },

    undoMoving: function() {
        if (this.mode == MODE_FROM_PALETTE)
            this.scene.removeChild(this);
        else if (this.mode == MODE_FROM_PROGRAM) {
            this.x = this.positionInProgram.x
            this.y = this.positionInProgram.y
        }
    },

    remove: function() {
        if (this.mode == MODE_IN_PROGRAM || this.mode == MODE_FROM_PROGRAM) {
            var curCode = this.positionInProgram.code;
            var curIndex = this.positionInProgram.index;
            curCode[curIndex] = undefined;
        }

        this.scene.removeChild(this);
    },

    put: function(x, y, code, index) {
        if (this.mode == MODE_FROM_PROGRAM ||
            this.mode == MODE_IN_PROGRAM) {
            var curCode = this.positionInProgram.code;
            var curIndex = this.positionInProgram.index;
            curCode[curIndex] = undefined;
        }

        this.mode = MODE_IN_PROGRAM;
        this.positionInProgram = {
            x: x,
            y: y,
            code: code,
            index: index};
        this.x = x;
        this.y = y;
        code[index] = this;
    },

    getToken: function() {
        return this.token;
    },
});

var EditorBlockLoop = enchant.Class.create(EditorBlock, {
    initialize: function(scene, x, y, imgsrc) {
        EditorBlock.call(this, scene, x, y, imgsrc, undefined);

        var countLabel = new enchant.Label("1");
        countLabel.count = 1;
        countLabel.x = BLOCK_SIZE / 2;
        countLabel.y = BLOCK_SIZE / 2;
        countLabel.font = "10px monospace";
        countLabel.color = "black";
        countLabel.addEventListener("touchstart", function(e) {
            console.log("touchstart Loop");
            if (++this.count >= 10)
                this.count = 1;
            this.text = this.count;
            e.done = true;
        });
        this.eventListener
        this.countLabel = countLabel;
        this.addChild(countLabel);
    },

    clone: function() {
        return  new EditorBlockLoop(this.scene, this.x, this.y, this.imgsrc);
    },

    getToken: function() {
        return new TokenLoop(this.countLabel.count);
    },
});

var EditorBlockFuncall = enchant.Class.create(EditorBlock, {
    initialize: function(scene, x, y, imgsrc, name) {
        EditorBlock.call(this, scene, x, y, imgsrc, undefined);
        this.name = name;
    },

    clone: function() {
        return new EditorBlockFuncall(this.scene, this.x, this.y,
                                      this.imgsrc, this.name);
    },

    getToken: function() {
        console.log("Funcall: "+this.name);
        return new TokenFuncall(this.name);
    },
});

var EditorBlockFuncallE = enchant.Class.create(EditorBlock, {
    initialize: function(scene, x, y, imgsrc, name) {
        EditorBlock.call(this, scene, x, y, imgsrc, undefined);
        this.name = name;
    },

    clone: function() {
        return new EditorBlockFuncallE(this.scene, this.x, this.y,
                                       this.imgsrc, this.name);
    },

    getToken: function() {
        console.log("Funcall: "+this.name);
        return new TokenFuncallE(this.name);
    },
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

var HighlightAtDrop = enchant.Class.create(enchant.Sprite, {
    initialize: function(scene) {
        enchant.Sprite.call(this, 34, 34);
        this.scene = scene;
        this.location = undefined;
        this.x = undefined;
        this.y = undefined;
        this.dropType = NO_HIGHLIGHT;
        this.image = game.assets[REPLACE];
        this.visible = false;
        this.scene.addChild(this);
    },

    move: function(scene, x, y, dropType) {
        this.scene = scene;
        this.x = x - 1;
        this.y = y - 1;
        if (this.dropType == dropType)
            return;
        this.dropType = dropType;
        if (this.dropType == AFTER_BLOCK) {
            this.image = game.assets[INSERT];
            this.visible = true;
        } else if (this.dropType == REPLACE_BLOCK) {
            this.image = game.assets[REPLACE];
            this.visible = true;
        } else {
            this.visible = false;
        }
    },

    remove: function() {
        this.dropType = NO_HIGHLIGHT;
        this.visible = false;
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
        loadMap(id);
        var mapData = maps[0];
        var map = new ScrollMap(mapData, MAP, [COIN]);
        map.setOrigin(0, 0);
        map.place(this, 0, 0, 16, 16);
        this.map = map;
//        this.addChild(new Player(mapData.init.x,
//                                 mapData.init.y,
//                                 mapData.init.dir));
//        this.addChild(new Goal(mapData.goal.x, mapData.goal.y));

        var mapOriginBeforeMove;
        var mapOriginPrev;
        this.map.ui.addEventListener("touchstart", function(e) {
            this.clkOffX = e.x - this.x;
            this.clkOffY = e.y - this.y;
            mapOriginBeforeMove = this.getOrigin();
            mapOriginPrev = mapOriginBeforeMove;
        });
        this.map.ui.addEventListener("touchmove", function(e) {
            var dx = e.x - this.clkOffX;
            var dy = e.y - this.clkOffY;
            var dc = Math.floor(dx / MAP_TILE_SIZE);
            var dr = Math.floor(dy / MAP_TILE_SIZE);
            var oo = mapOriginBeforeMove;
            var nc = oo.left - dc;
            var nr = oo.top - dr;
            if (nr != mapOriginPrev.top || nc != mapOriginPrev.left) {
                this.setOrigin(nc, nr);
                mapOriginPrev = this.getOrigin();
            }
        });

        const PALETTE_CONTENTS = [
            [EditorBlock, ADVANCE, new TokenForward()],
            undefined,
            [EditorBlock, RIGHT,   new TokenRight()],
            [EditorBlock, LEFT,    new TokenLeft()],
            [EditorBlockLoop, BSTART],
            [EditorBlock, BEND,    new TokenBlockEnd()],
            [EditorBlockFuncall,  S_SPEAD,  "spead"],
            [EditorBlockFuncall,  S_HEART,  "heart"],
            [EditorBlockFuncall,  S_DIA,    "dia"],
            [EditorBlockFuncall,  S_CLOVER, "clover"],
            [EditorBlockFuncallE, N_SPEAD,  "spead"],
            [EditorBlockFuncallE, N_HEART,  "heart"],
            [EditorBlockFuncallE, N_DIA,    "dia"],
            [EditorBlockFuncallE, N_CLOVER, "clover"],
            [EditorBlock, ARG,     new TokenParam((gameMode == "argf"))]
        ];
        this.PALETTE_OFFSET_X = map.x + map.width + 10;
        this.PALETTE_OFFSET_Y = 10;
        this.PALETTE_WIDTH = 76; /* img_size 32 * 2 +
                                  * margin 4 * 3(left,center,right) */
        this.PALETTE_HEIGHT = ((PALETTE_CONTENTS.length + 1) >> 1) * 36 + 4;

        /* editor zone */
        /* paletteArrayよりも下のレイヤに描画する必要があるため先に描画 */
        this.SCROLL_BLOCK_HEIGHT = 12; // EDITOR_PROGRAM_TOPをずらすためここに配置
        this.EDITOR_X = this.PALETTE_OFFSET_X + this.PALETTE_WIDTH + 24;
        this.EDITOR_Y = this.PALETTE_OFFSET_Y;
        this.BLOCK_SIZE = 32;
        this.EDITOR_PROGRAM_TOP = this.EDITOR_Y + this.BLOCK_SIZE
                                  + this.SCROLL_BLOCK_HEIGHT;
        this.EDITOR_BLOCK_MARGIN = 4;
        this.CODE_LEN = 12;
        this.EDITOR_MARGIN = 16;
        this.FUNC_SYMBOL = [undefined, SPEAD, HEART, DIA, CLOVER];
        this.SCROLL_SYMBOL = [UP, DOWN];

        this.editingProgram = [];  // array of code
        this.visibleProgram = [];
        this.visibleTop = [];
        this.visibleBottom = [];
        var baseline = this.EDITOR_X;
        for (var i = 0; i < this.FUNC_SYMBOL.length; i++) {
            var code = [];
            var visibleCode = [];
            for (var j = 0; j < this.CODE_LEN; j++) {
                code.push(undefined);
                visibleCode.push(undefined);
            }
            this.editingProgram.push(code);
            this.visibleProgram.push(visibleCode);
            this.visibleTop.push(0);
            this.visibleBottom.push(this.CODE_LEN - 1);

            var rect = new FillSquare(
                baseline - this.EDITOR_BLOCK_MARGIN,
                this.EDITOR_PROGRAM_TOP,
                this.BLOCK_SIZE + this.EDITOR_BLOCK_MARGIN * 2,
                this.CODE_LEN * this.BLOCK_SIZE + this.EDITOR_BLOCK_MARGIN * 2);
            this.addChild(rect);

            if (this.FUNC_SYMBOL[i]) {
                new DrawImage(this,
                              baseline, this.EDITOR_Y,
                              this.BLOCK_SIZE, this.BLOCK_SIZE,
                              this.FUNC_SYMBOL[i]);
            }

            /* scroll zone */
            var scroll_up = new FillSquare(
                baseline,
                this.EDITOR_PROGRAM_TOP - this.SCROLL_BLOCK_HEIGHT + 1,
                this.BLOCK_SIZE + this.EDITOR_BLOCK_MARGIN * 2,
                this.SCROLL_BLOCK_HEIGHT);
            scroll_up.image = game.assets[this.SCROLL_SYMBOL[0]];
            scroll_up.addEventListener("touchstart", function(e) {
                var pos = this.getPositionByLocation(e.x, e.y);
                if (!(pos.zone == SCROLL_ZONE)) {
                    return;
                }
                var funcNo = pos.funcNo;
                this.scrollUp(funcNo);
            }.bind(this));
            this.addChild(scroll_up);

            var scroll_down = new FillSquare(
                baseline,
                this.EDITOR_PROGRAM_TOP + this.CODE_LEN * this.BLOCK_SIZE
                                        + this.EDITOR_BLOCK_MARGIN * 2 - 1,
                this.BLOCK_SIZE + this.EDITOR_BLOCK_MARGIN * 2,
                this.SCROLL_BLOCK_HEIGHT);
            scroll_down.image = game.assets[this.SCROLL_SYMBOL[1]];
            scroll_down.addEventListener("touchstart", function(e) {
                var pos = this.getPositionByLocation(e.x, e.y);
                if (!(pos.zone == SCROLL_ZONE)) {
                    return;
                }
                var funcNo = pos.funcNo;
                this.scrollDown(funcNo);
            }.bind(this));
            this.addChild(scroll_down);

            baseline += this.BLOCK_SIZE + this.EDITOR_MARGIN;
        }

        /* palette zone */
        var paletteBackground = new FillSquare(this.PALETTE_OFFSET_X - 4,
                                               this.PALETTE_OFFSET_Y - 4,
                                               this.PALETTE_WIDTH,
                                               this.PALETTE_HEIGHT);
        this.addChild(paletteBackground);
        for (var i = 0; i < PALETTE_CONTENTS.length; i++) {
            /* 横2列に1,2,\n 3,4,\n 5,6,...と配置する */
            var x = this.PALETTE_OFFSET_X + (i & 1) * 36;
            var y = this.PALETTE_OFFSET_Y + (i >> 1) * 36;
            var def = PALETTE_CONTENTS[i];
            if (def == undefined)
                continue;
            var ctor = def[0];
            new ctor(this, x, y, def[1], def[2]);
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
                    var prog = this.editScene.getProgram();
                    if (prog !== undefined)
                        game.pushScene(new PlayScene(id, prog));
                });
            },
        }))(this);
        this.highlightAtDrop = new HighlightAtDrop(this, paletteBackground);
        this.addChild(playButton);
    },

    codeToViewIndex: function(funcNo, codeIndex) {
        return codeIndex - this.visibleTop[funcNo];
    },

    viewToCodeIndex: function(funcNo, viewIndex) {
        return viewIndex + this.visibleTop[funcNo];
    },

    existsBlock: function(block) {
        if (block.mode == MODE_FROM_PROGRAM || block.mode == MODE_IN_PROGRAM)
            return true;
        else
            return false;
    },

    getFuncNo: function(block) {
        if (block.mode == MODE_FROM_PROGRAM || block.mode == MODE_IN_PROGRAM) {
            var code = block.positionInProgram.code;
            for (var i = 0; i < this.editingProgram.length; i++)
                if (code === this.editingProgram[i])
                    return i;
        }
        return undefined;
    },

    scrollUp: function(funcNo) {
        var code = this.editingProgram[funcNo];
        var visibleCode = this.visibleProgram[funcNo];
        if (this.visibleTop[funcNo] <= 0) {
            return;
        }

        if (code[this.visibleTop[funcNo] - 1])
            this.addChild(code[this.visibleTop[funcNo] - 1]);
        if (code[this.visibleBottom[funcNo]])
            this.removeChild(code[this.visibleBottom[funcNo]]);

        this.visibleTop[funcNo]--;
        this.visibleBottom[funcNo]--;

        var x = this.EDITOR_X + (this.BLOCK_SIZE + this.EDITOR_MARGIN) * funcNo;
        for (var i = 0; i < this.CODE_LEN; i++) { // i is viewIndex
            var codeIndex = this.viewToCodeIndex(funcNo, i);
            var slideBlock = code[codeIndex];
            if (slideBlock) {
                var y = this.EDITOR_PROGRAM_TOP + this.BLOCK_SIZE * i;
                slideBlock.put(x, y, code, codeIndex);
                visibleCode[i] = slideBlock;
            } else {
                code[codeIndex] = undefined;
                visibleCode[i] = undefined;
            }
        }
    },

    scrollDown: function(funcNo) {
        var code = this.editingProgram[funcNo];
        var visibleCode = this.visibleProgram[funcNo];
        if (this.visibleBottom[funcNo] >= code.length - 1) {
            return;
        }

        if (code[this.visibleTop[funcNo]])
            this.removeChild(code[this.visibleTop[funcNo]]);
        if (code[this.visibleBottom[funcNo] + 1])
            this.addChild(code[this.visibleBottom[funcNo] + 1]);

        this.visibleTop[funcNo]++;
        this.visibleBottom[funcNo]++;

        var x = this.EDITOR_X + (this.BLOCK_SIZE + this.EDITOR_MARGIN) * funcNo;
        for (var i = 0; i < this.CODE_LEN; i++) { // i is viewIndex
            var codeIndex = this.viewToCodeIndex(funcNo, i);
            var slideBlock = code[codeIndex];
            if (slideBlock) {
                var y = this.EDITOR_PROGRAM_TOP + this.BLOCK_SIZE * i;
                slideBlock.put(x, y, code, codeIndex);
                visibleCode[i] = slideBlock;
            } else {
                code[codeIndex] = undefined;
                visibleCode[i] = undefined;
            }
        }
    },

    getPositionByLocation: function(x,y) {
        /* location is in palette */
        if (x >= this.PALETTE_OFFSET_X - 4 &&
            x <= this.PALETTE_OFFSET_X + this.PALETTE_WIDTH &&
            y >= this.PALETTE_OFFSET_Y - 4 &&
            y <= this.PALETTE_OFFSET_Y + this.PALETTE_HEIGHT) {
            return {zone: PALETTE_ZONE};
        }

        /* out of range of y of program editor, cause fast return */
        // console.log(this.EDITOR_PROGRAM_TOP);
        // = 42
        // console.log(this.EDITOR_PROGRAM_TOP + this.BLOCK_NUM * this.BLOCK_SIZE);
        // = 426
        // 一番下に挿入した場合誤作動する
        y -= this.EDITOR_BLOCK_MARGIN;
        if (!(y >= this.EDITOR_PROGRAM_TOP - this.SCROLL_BLOCK_HEIGHT &&
              y <= this.EDITOR_PROGRAM_TOP + this.CODE_LEN * this.BLOCK_SIZE
                                           + this.SCROLL_BLOCK_HEIGHT)) {
            return {zone: undefined};
        }

        var viewIndex = Math.floor((y - this.EDITOR_PROGRAM_TOP)
                                   / this.BLOCK_SIZE);
        var offset = y - this.EDITOR_PROGRAM_TOP - this.BLOCK_SIZE * viewIndex;
        var left = this.EDITOR_X;
        for (var i = 0; i < this.FUNC_SYMBOL.length + 1; i++) {
            if (x >= left && x <= left + this.BLOCK_SIZE) {
                if (!(y >= this.EDITOR_PROGRAM_TOP &&
                      y <= this.EDITOR_PROGRAM_TOP
                           + this.CODE_LEN * this.BLOCK_SIZE)) {
                    return {zone: SCROLL_ZONE, funcNo: i};
                }
                return {zone: PROGRAM_ZONE, funcNo: i,
                        viewIndex: viewIndex, offset: offset};
            }
            left += this.BLOCK_SIZE + this.EDITOR_MARGIN;
        }

        return {zone: undefined};
    },

    canInsert: function(code, viewIndex) {
        // code size is unlimited.
        /*
            for (var i = index; i < code.length; i++)
                if (code[i] == undefined)
                    return true;
            return false;
        */
        return true;
    },

    actionIfDrop: function(code, visibleCode, viewIndex, offset) {
        if (offset < EDIT_INSERT_BLOCK_EDGE) {
            if ((viewIndex == 0 && visibleCode[viewIndex] != undefined ) ||
                (visibleCode[viewIndex - 1] != undefined &&
                 visibleCode[viewIndex] != undefined) &&
                this.canInsert(code, viewIndex))
                return ACTION_INSERT_BEFORE;
        } else if (offset >= this.BLOCK_SIZE - EDIT_INSERT_BLOCK_EDGE) {
            if (viewIndex < visibleCode.length - 1 &&
                visibleCode[viewIndex] != undefined &&
                visibleCode[viewIndex + 1] != undefined &&
                this.canInsert(code, viewIndex + 1))
                return ACTION_INSERT_AFTER;
        }

        if (visibleCode[viewIndex] == undefined)
            return ACTION_PUT;

        return ACTION_UNDO;
    },

    highlightLocation: function(x, y) {
        var pos = this.getPositionByLocation(x, y);

        if (pos.zone == PROGRAM_ZONE) {
            var x = (this.EDITOR_X +
                     (this.BLOCK_SIZE + this.EDITOR_MARGIN) * pos.funcNo);
            var code = this.editingProgram[pos.funcNo];
            var visibleCode = this.visibleProgram[pos.funcNo];
            var action = this.actionIfDrop(code, visibleCode,
                                           pos.viewIndex, pos.offset);
                                           console.log(action);
            if (action == ACTION_INSERT_BEFORE) {
                var y = (this.EDITOR_PROGRAM_TOP
                         + this.BLOCK_SIZE * (pos.viewIndex - 1)
                         + INSERT_OFFSET);
                this.highlightAtDrop.move(this, x, y, AFTER_BLOCK);
            } else if (action == ACTION_INSERT_AFTER) {
                var y = (this.EDITOR_PROGRAM_TOP
                         + this.BLOCK_SIZE * pos.viewIndex + INSERT_OFFSET);
                this.highlightAtDrop.move(this, x, y, AFTER_BLOCK);
            } else if (action == ACTION_PUT) {
                var y = this.EDITOR_PROGRAM_TOP
                        + this.BLOCK_SIZE * pos.viewIndex;
                this.highlightAtDrop.move(this, x, y, REPLACE_BLOCK);
            } else
                this.highlightAtDrop.remove();
        } else
            this.highlightAtDrop.remove();
    },

    dropBlock: function(block, x, y) {
        this.scene.highlightAtDrop.remove();
        var pos = this.getPositionByLocation(x, y);
        if (pos.zone == undefined)
            block.undoMoving();
        else if (pos.zone == PALETTE_ZONE)
            this.removeBlock(block);
        else if (pos.zone == PROGRAM_ZONE) {
            var code = this.editingProgram[pos.funcNo];
            var visibleCode = this.visibleProgram[pos.funcNo];
            var action = this.actionIfDrop(code, visibleCode,
                                           pos.viewIndex, pos.offset);
            if (action == ACTION_INSERT_BEFORE)
                this.insertBlock(pos.funcNo, pos.viewIndex, block);
            else if (action == ACTION_INSERT_AFTER)
                this.insertBlock(pos.funcNo, pos.viewIndex + 1, block);
            else if (action == ACTION_PUT)
                this.putBlock(pos.funcNo, pos.viewIndex, block);
            else if (action == ACTION_UNDO)
                block.undoMoving();
        } else
            block.undoMoving();
    },

    removeBlock: function(block) {
        this.removeBlockFromVisibleProgram(block);
        block.remove();
    },

    removeBlockFromVisibleProgram: function(block) {
        if (this.existsBlock(block)) {
            var prevFuncNo = this.getFuncNo(block);
            var prevViewIndex = this.codeToViewIndex(prevFuncNo,
                                    block.positionInProgram.index);
            this.visibleProgram[prevFuncNo][prevViewIndex] = undefined;
        }
    },

    putBlock: function(funcNo, viewIndex, block) {
        var code = this.editingProgram[funcNo];
        var visibleCode = this.visibleProgram[funcNo];
        var x = this.EDITOR_X + (this.BLOCK_SIZE + this.EDITOR_MARGIN) * funcNo;
        var y = this.EDITOR_PROGRAM_TOP + this.BLOCK_SIZE * viewIndex;
        this.removeBlockFromVisibleProgram(block);
        block.put(x, y, code, this.viewToCodeIndex(funcNo, viewIndex));
        visibleCode[viewIndex] = block;
    },

    insertBlock: function(funcNo, viewIndex, block) {
        var code = this.editingProgram[funcNo];

        /* find blank" */
        var codeIndex = this.viewToCodeIndex(funcNo, viewIndex);
        var prevCodeIndex = undefined;
        if (this.getFuncNo(block) == funcNo)
            prevCodeIndex = block.positionInProgram.index;

        var blankIndex = codeIndex;
        while (!(code[blankIndex] == undefined || prevCodeIndex == blankIndex ||
                 blankIndex >= code.length)) {
            blankIndex++;
        }

        /* remove from visibleProgram */
        this.removeBlockFromVisibleProgram(block);

        /* make newCode */
        var newCode = [];
        for (var i = 0; i < codeIndex; i++) { // i = codeIndex
            if (code[i]) {
                var x = code[i].positionInProgram.x;
                var y = code[i].positionInProgram.y;
                code[i].put(x, y, newCode, i);
            }
            else
              newCode[i] = undefined;
        }

        for (var i = codeIndex; i < blankIndex; i++) {  // i = codeIndex
            var slideBlock = code[i];
            var viewIndexForSlideBlock = this.codeToViewIndex(funcNo, i + 1);
            var x = this.EDITOR_X +
                    (this.BLOCK_SIZE + this.EDITOR_MARGIN) * funcNo;
            var y = this.EDITOR_PROGRAM_TOP
                    + this.BLOCK_SIZE * viewIndexForSlideBlock;
            slideBlock.put(x, y, newCode, i + 1);
            if (viewIndexForSlideBlock > this.CODE_LEN - 1) // out of visible range
                this.removeChild(slideBlock);
        }

        for (var i = blankIndex + 1; i < code.length; i++) {  // i = codeIndex
            if (code[i]) {
                x = code[i].positionInProgram.x;
                y = code[i].positionInProgram.y;
                code[i].put(x, y, newCode, i);
            }
            else
              newCode[i] = undefined;
        }

        var x = this.EDITOR_X + (this.BLOCK_SIZE + this.EDITOR_MARGIN) * funcNo;
        var y = this.EDITOR_PROGRAM_TOP + this.BLOCK_SIZE * viewIndex;
        block.put(x, y, newCode, codeIndex);

        /* remake code */
        for (var i = 0; i < newCode.length; i++) {  // i = codeIndex
            if (newCode[i]) {
                var x = newCode[i].positionInProgram.x;
                var y = newCode[i].positionInProgram.y;
                console.log("x : " + x);
                console.log("y : "  + y);
                newCode[i].put(x, y, code, i);
            }
            else
              code[i] = undefined;
        }

        /* remake visibleCode */
        for (var i = 0; i < this.CODE_LEN; i++) {  // i = viewIndex
            var codeIndex = this.viewToCodeIndex(funcNo, i);
            console.log(i + " <- " + codeIndex);
            this.visibleProgram[funcNo][i] = code[codeIndex];
        }
    },

    getProgram: function() {
        var program = new Program();
        for (var i = 0; i < FUNC_NAME.length; i++) {
            var editingCode = this.editingProgram[i];
            var code = [];
            for (var j = 0; j < editingCode.length; j++) {
                if (editingCode[j])
                    code.push(editingCode[j].getToken());
                else
                    code.push(new TokenBlank());
            }
            if (!program.add(FUNC_NAME[i], code)) {
                alert("invalid program");
                return undefined;
            }
        }
        return program;
    }
});

/* Local Variables: */
/* indent-tabs-mode: nil */
/* End: */
