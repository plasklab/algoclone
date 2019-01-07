var Loop_start = enchant.Class.create(Terminal_symbol, {
  initialize: function() {
    Terminal_symbol.call(this, "loop_start");
    this.height = 16;
    this.image = game.assets[LSTART];
    this.n = 1;
    this.n_label = this.initialize_label(String(this.n));
  },

  initialize_label: function(string) {
    var label = new Label(string);
    label.width = 14;
    label.height = 10;
    label.x = this.x + (this.width - label.width) / 2 - 2;
    label.y = this.y + (this.height - label.height);
    label.textAlign = "center";
    label.font = "10px 'MSゴシック'"
    label.backgroundColor = "white";
    return label;
  },

  create_block: function(loop, stage) {
    this.set_image(loop.start.image);
    this.set_x(loop.start.x);
    this.set_y(loop.start.y);
    this.set_n(loop.start.n);
    this.set_backgroundColor(loop.start.backgroundColor);
    this.register_inc_n(stage);
    this.register_label_move();
  },

  copy_block: function(stage, x, y) {
    var ls = new Loop_start();
    ls.set_x(x);
    ls.set_y(y);
    ls.set_n(this.n);
    ls.set_backgroundColor(this.backgroundColor);
    ls.register_label_move();
    ls.loop = new Sprite(32, ls.height);
    ls.loop.x = x;
    ls.loop.y = y;
    ls.register_loop_space();
    ls.loop.backgroundColor = "gainsboro";
    stage.addChild(ls.loop);
    stage.addChild(ls);
    stage.addChild(ls.n_label);
    return ls;
  },

  set_block: function(x, y, color, stage, loop, end) {
    this.set_x(x);
    this.set_y(y);
    this.set_n(loop.start.n);
    this.set_backgroundColor(color);
    this.register_init_move(stage, loop);
    this.register_init_append(stage);
    this.register_inc_n(stage);
    this.register_label_move();
  },

  set_n: function(n) {
    this.n = n;
    this.n_label.text = String(this.n);
  },

  inc_loop_n: function() {
    this.n++;
    if (this.n == 11) {
      this.n = 1;
    }
  },

  /* ラベルに関するイベントリスナ */
  register_inc_n: function(stage) {
    this.n_label.addEventListener("touchstart", function() {
      if (stage.play_flag) return;
      this.inc_loop_n();
      this.n_label.text = String(this.n);
    }.bind(this));
  },

  /* ラベルに関するイベントリスナ */
  register_label_move: function() {
    this.n_label.addEventListener("enterframe", function() {
      this.n_label.x = this.x + (this.width - this.n_label.width) / 2 - 2;
      this.n_label.y = this.y + (this.height - this.n_label.height);
    }.bind(this));
  },

  register_loop_space: function() {
    this.loop.addEventListener("enterframe", function() {
      this.loop.x = this.x;
      this.loop.y = this.y;
    }.bind(this));
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
      node.y = e.y;
      node.start.x = e.x;
      node.start.y = e.y;
      node.end.x = e.x;
      node.end.y = e.y + this.height + 5;
    })
  },

  register_init_append: function(stage) {
    this.addEventListener("touchend", function(e) {
      console.log("init_block_append : " + this.node.start.type);
      stage.is_touch = true;
      return this.node.loop_append(stage, e);
    });
  },

  register_above: function(stage, loop) {
    this.addEventListener("touchstart", function() {
      if (stage.play_flag) return;
      loop.most_above(stage);
      loop.keep_y = loop.y;
      loop.keep_x = loop.x;
    });
  },

  register_move: function(stage, loop) {
    this.addEventListener("touchmove", function(e) {
      if (stage.play_flag) return;
      this.x = e.x;
      this.y = e.y;
      loop.x = e.x;
      loop.y = e.y;
      loop.end.x = e.x;
      loop.end.y = e.y + this.height + 5;
    });
  },

  register_append: function(stage, loop) {
    this.addEventListener("touchend", function(e) {
      if (stage.play_flag) return;
      console.log("loop_start register_append");
      var prev = this.prev;
      if (!loop.loop_delete(this, e)) {
        stage.prog.debug();
        return false;
      }
      if (loop.keep_x - 5 < loop.x &&
        loop.keep_x + loop.width + 5 > loop.x) {
        if (prev.type != "loop_end") {
          e.y -= this.height + 5;
        } else if (loop.keep_y < loop.y) {
          e.y -= loop.height;
        }
      }
      return loop.loop_append(stage, e);
    });
  }
});