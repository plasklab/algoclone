const BLOCK_SIZE = 32;

const PROGRAM_MAIN = "main";
const PALETTE_ZONE = "palette zone";
const PROGRAM_ZONE = "program zone";
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
                this.scene.insertBefore(b, this.scene.highlightAtDrop);
            } else if (this.mode == MODE_IN_PROGRAM)
                this.mode = MODE_FROM_PROGRAM;
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
        loadMap();
        var mapData = maps[0];
        var map = new ScrollMap(mapData, MAP, [DIA]);
        map.setOrigin(0, 0);
        map.place(this, 0, 0, 10, 16);
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
            [EditorBlockFuncall, S_SPEAD,  "spead"],
            [EditorBlockFuncall, S_HEART,  "heart"],
            [EditorBlockFuncall, S_DIA,    "dia"],
            [EditorBlockFuncall, S_CLOVER, "clover"],
            [EditorBlock, ARG,     new TokenParam()]
        ];
        this.PALETTE_OFFSET_X = map.x + map.width + 10;
        this.PALETTE_OFFSET_Y = 10;
        this.PALETTE_WIDTH = 76; /* img_size 32 * 2 +
                                  * margin 4 * 3(left,center,right) */
        this.PALETTE_HEIGHT = ((PALETTE_CONTENTS.length + 1) >> 1) * 36 + 4;

        /* editor zone */
        /* paletteArrayよりも下のレイヤに描画する必要があるため先に描画 */
        this.EDITOR_X = this.PALETTE_OFFSET_X + this.PALETTE_WIDTH + 24;
        this.EDITOR_Y = this.PALETTE_OFFSET_Y;
        this.BLOCK_SIZE = 32;
        this.EDITOR_PROGRAM_TOP = this.EDITOR_Y + this.BLOCK_SIZE;
        this.EDITOR_BLOCK_MARGIN = 4;
        this.CODE_LEN = 12;
        this.EDITOR_MARGIN = 16;
        this.FUNC_SYMBOL = [undefined, SPEAD, HEART, DIA, CLOVER];

        this.editingProgram = [];  // array of code
        var baseline = this.EDITOR_X;
        for (var i = 0; i < this.FUNC_SYMBOL.length; i++) {
            var code = [];
            for (var j = 0; j < this.CODE_LEN; j++)
                code.push(undefined);
            this.editingProgram.push(code);

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
        if (!(y >= this.EDITOR_PROGRAM_TOP &&
              y <= this.EDITOR_PROGRAM_TOP + this.CODE_LEN * this.BLOCK_SIZE)) {
            return {zone: undefined};
        }

        var index = Math.floor((y - this.EDITOR_PROGRAM_TOP) / this.BLOCK_SIZE);
        var offset = y - this.EDITOR_PROGRAM_TOP - this.BLOCK_SIZE * index;
        var left = this.EDITOR_X;
        for (var i = 0; i < this.FUNC_SYMBOL.length + 1; i++) {
            if (x >= left && x <= left + this.BLOCK_SIZE) {
                return {zone: PROGRAM_ZONE, funcNo: i,
                        index: index, offset: offset};
            }
            left += this.BLOCK_SIZE + this.EDITOR_MARGIN;
        }
        
        return {zone: undefined};
    },

    canInsert: function(code, index) {
        for (var i = index; i < code.length; i++)
            if (code[i] == undefined)
                return true;
        return false;
    },
    
    actionIfDrop: function(code, index, offset) {
        if (offset < EDIT_INSERT_BLOCK_EDGE) {
            if ((index == 0 && code[index] != undefined )||
                (code[index - 1] != undefined && code[index] != undefined) &&
                this.canInsert(code, index))
                return ACTION_INSERT_BEFORE;
        } else if (offset >= this.BLOCK_SIZE - EDIT_INSERT_BLOCK_EDGE) {
            if (index < code.length - 1 &&
                code[index] != undefined && code[index + 1] != undefined &&
                this.canInsert(code, index + 1))
                return ACTION_INSERT_AFTER;
        }

        if (code[index] == undefined)
            return ACTION_PUT;

        return ACTION_UNDO;
    },
    
    highlightLocation: function(x, y) {
        var pos = this.getPositionByLocation(x, y);

        if (pos.zone == PROGRAM_ZONE) {
            var x = (this.EDITOR_X +
                     (this.BLOCK_SIZE + this.EDITOR_MARGIN) * pos.funcNo);
            var code = this.editingProgram[pos.funcNo];
            var action = this.actionIfDrop(code, pos.index, pos.offset);
            if (action == ACTION_INSERT_BEFORE) {
                var y = (this.EDITOR_PROGRAM_TOP
                         + this.BLOCK_SIZE * (pos.index - 1) + INSERT_OFFSET);
                this.highlightAtDrop.move(this, x, y, AFTER_BLOCK);
            } else if (action == ACTION_INSERT_AFTER) {
                var y = (this.EDITOR_PROGRAM_TOP
                         + this.BLOCK_SIZE * pos.index + INSERT_OFFSET);
                this.highlightAtDrop.move(this, x, y, AFTER_BLOCK);
            } else if (action == ACTION_PUT) {
                var y = this.EDITOR_PROGRAM_TOP + this.BLOCK_SIZE * pos.index;
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
            block.remove();
        else if (pos.zone == PROGRAM_ZONE) {
            var code = this.editingProgram[pos.funcNo];
            var action = this.actionIfDrop(code, pos.index, pos.offset);
            if (action == ACTION_INSERT_BEFORE)
                this.insertBlock(pos.funcNo, pos.index, block);
            else if (action == ACTION_INSERT_AFTER)
                this.insertBlock(pos.funcNo, pos.index + 1, block);
            else if (action == ACTION_PUT)
                this.putBlock(pos.funcNo, pos.index, block);
            else if (action == ACTION_UNDO)
                block.undoMoving();
        } else
            block.undoMoving();
    },
    
    putBlock: function(funcNo, index, block) {
        var code = this.editingProgram[funcNo];
        var x = this.EDITOR_X + (this.BLOCK_SIZE + this.EDITOR_MARGIN) * funcNo;
        var y = this.EDITOR_PROGRAM_TOP + this.BLOCK_SIZE * index;
        block.put(x, y, code, index);
    },

    insertBlock: function(funcNo, index, block) {
        var code = this.editingProgram[funcNo];

        // There should be at least one blank because insertBlock
        // is called only if actionIfDrop made decision of insert.
        var blankIndex = index;
        while (code[blankIndex])
            blankIndex++;

        var x = this.EDITOR_X + (this.BLOCK_SIZE + this.EDITOR_MARGIN) * funcNo;
        for (var i = blankIndex - 1; i >= index; i--) {
            var slideBlock = code[i];
            if (slideBlock) {
                var y = this.EDITOR_PROGRAM_TOP + this.BLOCK_SIZE * (i + 1);
                slideBlock.put(x, y, code, i + 1);
            }
        }
        this.putBlock(funcNo, index, block);
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
