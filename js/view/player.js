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
});