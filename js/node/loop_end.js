var Loop_end = enchant.Class.create(Terminal_symbol, {
  initialize: function() {
    Terminal_symbol.call(this, "loop_end");
    this.height = 16;
    this.image = game.assets[LEND];
  },

  create_block: function(loop, stage) {
    this.set_image(loop.end.image);
    this.set_x(loop.end.x);
    this.set_y(loop.y + loop.height - this.height);
    this.set_backgroundColor(loop.end.backgroundColor);
  },

  set_block: function(x, y, color, stage, loop, start) {
    this.set_x(x);
    this.set_y(y);
    this.set_backgroundColor(color);
    this.register_init_move(stage, loop);
    this.register_init_append(stage);
  },

  copy_block: function(stage, x, y) {
    var le = new Loop_end();
    le.set_x(x);
    le.set_y(y);
    le.set_backgroundColor(this.backgroundColor);
    stage.addChild(le);
    return le;
  },

  register_init_move: function(stage, loop) {
    this.addEventListener("touchmove", function(e) {
      var node = this.node;
      if (stage.is_touch) {
        node = loop.create_block(stage, e.x, e.y, loop);
        node.loop_addChild(stage);
        this.node = node;
        stage.is_touch = false;
      }
      node.x = e.x;
      node.y = e.y - this.height - 5;
      node.start.x = e.x;
      node.start.y = e.y - this.height - 5;
      node.end.x = e.x;
      node.end.y = e.y;
    });
  },

  register_init_append: function(stage) {
    this.addEventListener("touchend", function(e) {
      console.log("init_block_append : " + this.node.end.type);
      stage.is_touch = true;
      return this.node.loop_append(stage, e);
    });
  },

  register_above: function(stage, loop) {
    this.addEventListener("touchstart", function() {
      if (stage.play_flag) return;
      loop.most_above(stage);
      loop.keep_x = this.x;
      loop.keep_y = this.y;
    });
  },

  register_move: function(stage, loop) {
    this.addEventListener("touchmove", function(e) {
      if (stage.play_flag) return;
      this.x = e.x;
      this.y = e.y;
      loop.x = e.x;
      loop.y = e.y - this.height - 5;
      loop.start.x = e.x;
      loop.start.y = e.y - this.height - 5;
    });
  },

  register_append: function(stage, loop) {
    this.addEventListener("touchend", function(e) {
      if (stage.play_flag) return;
      console.log("loop_end register_append");
      var prev = this.prev;
      if (!loop.loop_delete(this, e)) {
        stage.prog.debug();
        return false;
      }
      if (loop.keep_x - 5 < loop.x &&
        loop.keep_x + loop.width + 5 > loop.x) {
        if (e.y > loop.keep_y + this.height) {
          e.y -= loop.height + 5;
        }
      }
      return loop.loop_append(stage, e);
    });
  }
});