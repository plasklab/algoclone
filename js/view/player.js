
const PLAYER_DIRECTION_UP = 0;
const PLAYER_DIRECTION_DOWN = 1;
const PLAYER_DIRECTION_LEFT = 2;
const PLAYER_DIRECTION_RIGHT = 3;
const PLAYER_SIZE = 32;

const MOVE_DIST = 16;

var Player = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y, direction) {
    enchant.Sprite.call(this, PLAYER_SIZE, PLAYER_SIZE);
    this.image = game.assets[PLAYER];
    this.setDirection(direction);
    this.x = x;
    this.y = y;
    this.direction = direction;
  },

  setDirection: function(dire) {
    var f = 0;
    if (dire == PLAYER_DIRECTION_UP) {
      f = 28;
    } else if (dire == PLAYER_DIRECTION_LEFT) {
      f = 10;
    } else if (dire == PLAYER_DIRECTION_RIGHT){
      f = 19;
    } else if (dire == PLAYER_DIRECTION_DOWN) {
      f = 1;
    } else {
      console.log("player set_direction error : " + dire);
    }
    this.frame = f;
  },

  moveForward: function() {
    switch (this.direction) {
        case PLAYER_DIRECTION_UP: {
            this.y -= MOVE_DIST;
        } break;
        case PLAYER_DIRECTION_DOWN: {
            this.y += MOVE_DIST;
        } break;
        case PLAYER_DIRECTION_LEFT: {
            this.x -= MOVE_DIST;
        } break;
        case PLAYER_DIRECTION_RIGHT: {
            this.x += MOVE_DIST;
        } break;
        default: debugprint("ERROR");
      }
  },
  /*
  rotateRight: function() {
    var d = 0;
    switch (this.direction) {
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
      default: debugprint("ERROR");
    }
    this.direction = d;
    this.setDirection(d);
  },

  rotateLeft: function() {
    var d = 0;
    switch (this.direction) {
      case PLAYER_DIRECTION_UP: {
        d = PLAYER_DIRECTION_LEFT;
      } break;
      case PLAYER_DIRECTION_DOWN: {
        d = PLAYER_DIRECTION_RIGHT;
      } break;
      case PLAYER_DIRECTION_RIGHT: {
        d = PLAYER_DIRECTION_DOWN;
      } break;
      case PLAYER_DIRECTION_LEFT: {
        d = PLAYER_DIRECTION_UP;
      } break;
      default: debugprint("ERROR");
    }
    this.direction = d;
    this.setDirection(d);
  },*/
  
});

/*
var Player = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y, direction) {
    enchant.Sprite.call(this, 32, 32);
    this.image = game.assets[PLAYER];
    this.frame = this.set_direction(direction);
    this.x = x;
    this.y = y;
  },

  set_direction: function(dire) {
    var d = 0;
    if (dire == "up") {
      d = 28;
    } else if (dire == "left") {
      d = 10;
    } else if (dire == "right"){
      d = 19;
    } else if (dire == "down") {
      d = 1;
    }
    if (d == 0) {
      console.log("player set_direction error : " + dire);
    }
    return d;
  },

  advance: function(state) {
    if (this.frame == 1) {
      this.move_down(state);
    } else if (this.frame == 10) {
      this.move_left(state);
    } else if (this.frame == 19) {
      this.move_right(state);
    } else if (this.frame == 28) {
      this.move_up(state);
    }
  },

  move_down: function(state) {
    var y = this.y;
    while (this.y - y < 16) {
      this.y += 4;
    }
    this.decision_map(state, this.x + 16, this.y + 16);
  },

  move_left: function(state) {
    var x = this.x;
    while (x - this.x < 16) {
      this.x -= 4;
    }
    this.decision_map(state, this.x + 16, this.y + 16);
  },

  move_right: function(state) {
    var x = this.x;
    while(this.x - x < 16) {
      this.x += 4;
    }
    this.decision_map(state, this.x + 16, this.y + 16);
  },

  move_up: function(state) {
    var y = this.y;
    while (y - this.y < 16) {
      this.y -= 4;
    }
    this.decision_map(state, this.x + 16, this.y + 16);
  },

  decision_map: function(state, x, y) {
    var map = stage.map;
    if (map.hitTest(x, y)) {
      this.opacity = 0;
      state.collision_flag = true;
      // retryに遷移
      console.log("collision");
    }
  },

  rotate_right: function(state) {
    if (this.frame == 1) {
      this.frame = 10;
    } else if (this.frame == 10) {
      this.frame = 28;
    } else if (this.frame == 19) {
      this.frame = 1;
    } else if (this.frame == 28) {
      this.frame = 19;
    }
  },

  rotate_left: function(state) {
    if (this.frame == 1) {
      this.frame = 19;
    } else if (this.frame == 10) {
      this.frame = 1;
    } else if (this.frame == 19) {
      this.frame = 28;
    } else if (this.frame == 28) {
      this.frame = 10;
    }
  },
});*/