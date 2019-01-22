// defiend in player.js (TODO: move to here)
//const PLAYER_DIRECTION_UP = 0;
//const PLAYER_DIRECTION_DOWN = 1;
//const PLAYER_DIRECTION_LEFT = 2;
//const PLAYER_DIRECTION_RIGHT = 3;
//const PLAYER_SIZE = 32;
const MAP_TILE_SIZE = 16;

var MapData = function(name, ground, gems, init, goal) {
    this.name = name;
    this.ground = ground;
    if (gems == undefined)
        this.gems = [];
    else
        this.gems = gems;
    this.init = init;  // {x, y, dir}
    this.goal = goal;  // {x, y}

    this.getGems = function() {
        var copied = [];
        for (var i = 0; i < this.gems.length; i++) {
            copied.push(this.gems[i].slice(0));
        }
        return copied;
    }

    this.getInitPos = function() {
        return Object.assign({}, this.init);
    }
}

var ScrollMap = enchant.Class.create({
    MapNode: enchant.Class.create(enchant.Group, {
        initialize: function(owner, cols, rows, image) {
            enchant.Group.call(this);
            this.owner = owner;
            this.viewport = [];
            this.cols = cols;
            this.rows = rows;
            this.image = image;
            this.gems = [];
            for (var r = 0; r < rows; r++) {
                var band = [];
                for (var c = 0; c < cols; c++) {
                    var tile = new enchant.Sprite(MAP_TILE_SIZE, MAP_TILE_SIZE);
                    tile.x = MAP_TILE_SIZE * c;
                    tile.y = MAP_TILE_SIZE * r;
                    tile.image = image;
                    this.addChild(tile);
                    band.push(tile);
                }
                this.viewport.push(band);
            }
        },

        set: function(col, row, index) {
            this.viewport[row][col].frame = index;
        },

        clearGems: function() {
            for (var i = 0; i < this.gems.length; i++)
                this.removeChild(this.gems[i]);
            this.gems = [];
        },

        putGem: function(col, row, image, frame, width, height, offX, offY) {
            if (frame == undefined)
                frame = 0;
            if (width == undefined)
                width = MAP_TILE_SIZE;
            if (height == undefined)
                height = MAP_TILE_SIZE;
            if (offX == undefined)
                offX = 0;
            if (offY == undefined)
                offY = 0;
            
            var tile = new enchant.Sprite(width, height);
            tile.x = MAP_TILE_SIZE * col + offX;
            tile.y = MAP_TILE_SIZE * row + offY;
            tile.image = image;
            tile.frame = frame;
            this.addChild(tile);
            this.gems.push(tile);
        },

        setOrigin: function(left, top) {
            this.owner.setOrigin(left, top);
            this.owner.redraw();
        },

        getOrigin: function() {
            return this.owner.vpOrigin;
        },
    }),
    
    initialize: function(mapData, imgsrc, gemImgsrcs) {
        this.mapData = mapData;

        this.ground = mapData.ground;  // array(row) of array(col)
        this.gems = mapData.getGems();
        this.player = mapData.getInitPos();

        // Player action
        this.player.moveForward = function() {
            var newX = this.x;
            var newY = this.y;
            switch (this.dir) {
                case PLAYER_DIRECTION_UP: newY -= 1; break;
                case PLAYER_DIRECTION_DOWN: newY += 1; break;
                case PLAYER_DIRECTION_RIGHT: newX += 1; break;
                case PLAYER_DIRECTION_LEFT: newX -= 1; break;
            }
            if (isValidPlayerPos(newX, newY, mapData.ground)) {
                this.x = newX;  this.y = newY;
                return true;
            } else { return false; }
        };
        this.player.rotateLeft = function() { this.dir = rotateLeft(this.dir); }
        this.player.rotateRight = function() { this.dir = rotateRight(this.dir); }

        // cols x rows is the size of the map.
        // The size of the viewport is this.ui.cols x this.ui.rows.
        this.rows = this.ground.length;
        if (this.ground.length == 0)
            this.cols = 0;
        else
            this.cols = this.ground[0].length;

        this.x = 0;
        this.y = 0;
        this.width = MAP_TILE_SIZE * this.cols;
        this.height = MAP_TILE_SIZE * this.rows;

        this.ui = undefined;
        this.image = game.assets[imgsrc];
        this.gemImgsrcs = gemImgsrcs
    },

    place: function(scene, x, y, cols, rows) {
        this.width = MAP_TILE_SIZE * cols;
        this.height = MAP_TILE_SIZE * rows;
        
        if (cols > this.cols)
            cols = this.cols;
        if (rows > this.rows)
            rows = this.rows;
        
        var ui = new this.MapNode(this, cols, rows, this.image);
        this.ui = ui;
        this.scene = scene;
        if (this.vpOrigin == undefined)
            this.setOrigin(0, 0);
        else
            // check boundary
            this.setOrigin(this.vpOrigin.left, this.vpOrigin.top);
        this.redraw();
        ui.moveTo(x, y);
        scene.addChild(ui);
    },
    
    setOrigin: function(left, top) {
        if (this.ui) {
            if (left < 0)
                left = 0;
            if (left + this.ui.cols > this.cols)
                left = this.cols - this.ui.cols;
            if (top < 0)
                top = 0;
            if (top + this.ui.rows > this.rows)
                top = this.rows - this.ui.rows;
        }
        
        this.vpOrigin = {
            left: left,
            top: top
        };
    },

    redraw: function() {
        var left = this.vpOrigin.left;
        var top = this.vpOrigin.top;

        // ground
        for (var r = 0; r < this.ui.rows; r++) {
            if (top + r >= this.ground.length)
                break;
            for (var c = 0; c < this.ui.cols; c++) {
                if (left + c >= this.ground[r].length)
                    break;
                var tileIndex = this.ground[top + r][left + c];
                this.ui.set(c, r, tileIndex);
            }
        }

        // gem
        this.ui.clearGems();
        for (var r = 0; r < this.ui.rows; r++) {
            if (top + r >= this.gems.length)
                break;
            for (var c = 0; c < this.ui.cols; c++) {
                if (left + c >= this.gems[r].length)
                    break;
                var tileIndex = this.gems[top + r][left + c];
                if (tileIndex == -1)
                    continue;
                var tile = game.assets[this.gemImgsrcs[tileIndex]];
                this.ui.putGem(c, r, tile);
            }
        }

        // player
        var pc = this.player.x - left;
        var pr = this.player.y - top;
        if (0 <= pc && pc < this.ui.cols && 0 <= pr && pr < this.ui.rows)
            // TODO: player image should be given from the client
            this.ui.putGem(pc, pr, game.assets[PLAYER],
                           (function(dir){
                               switch(dir) {
                               case PLAYER_DIRECTION_UP:    return 28;
                               case PLAYER_DIRECTION_LEFT:  return 10;
                               case PLAYER_DIRECTION_RIGHT: return 19;
                               case PLAYER_DIRECTION_DOWN:  return 1;
                               }
                           })(this.player.dir),
                           PLAYER_SIZE, PLAYER_SIZE, -8, -12);
    },

    getGem: function(x, y) {
        if (y < this.gems.length) {
            if (x < this.gems[y].length) {
                return this.gems[y][x];
            }
        }
        return -1;
    },

    setGem: function(x, y, gem) {
        // extends gems
        for (var i = this.gems.length; i < y + 1; i++)
            this.gems.push([]);
        for (var i = this.gems[y].length; i < x + 1; i++)
            this.gems[y].push(-1);
        this.gems[y][x] = gem;
    },
});

var isValidPlayerPos = function(x, y, ground) {
    return true; // TODO:
};

var rotateLeft = function(dir) {
    switch (dir) {
        case PLAYER_DIRECTION_UP: return PLAYER_DIRECTION_LEFT;
        case PLAYER_DIRECTION_LEFT: return PLAYER_DIRECTION_DOWN;
        case PLAYER_DIRECTION_DOWN: return PLAYER_DIRECTION_RIGHT;
        case PLAYER_DIRECTION_RIGHT: return PLAYER_DIRECTION_UP;
    }
};

var rotateRight = function(dir) {
    switch (dir) {
        case PLAYER_DIRECTION_UP: return PLAYER_DIRECTION_RIGHT;
        case PLAYER_DIRECTION_RIGHT: return PLAYER_DIRECTION_DOWN;
        case PLAYER_DIRECTION_DOWN: return PLAYER_DIRECTION_LEFT;
        case PLAYER_DIRECTION_LEFT: return PLAYER_DIRECTION_UP;
    }
};

/* Local Variables: */
/* indent-tabs-mode: nil */
/* End: */
