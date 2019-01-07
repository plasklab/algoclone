var Loop = enchant.Class.create(enchant.Sprite, {
  initialize: function() {
    enchant.Sprite.call(this, 32, 16 * 2 + 5);
    this.x;
    this.y;
    this.start = new Loop_start();
    this.end = new Loop_end();
    this.height = this.start.height + this.end.height + 5;
    this.backgroundColor = "gainsboro";
    this.register_height();
    // 移動前のブロックのx, y座標を保存
    this.keep_x;
    this.keep_y;
  },

  create_block: function(stage, x, y, loop) {
    var l = new Loop();
    l.x = x;
    l.y = y;
    l.start.create_block(loop, stage);
    l.end.create_block(loop, stage);
    l.start.register_move(stage, l);
    l.start.register_append(stage, l);
    l.start.register_above(stage, l);
    l.end.register_move(stage, l);
    l.end.register_append(stage, l);
    l.end.register_above(stage, l);
    return l;
  },

  set_block: function(x, y, stage) {
    this.x = x;
    this.y = y;
    this.start.set_block(this.x, this.y, "silver", stage, this, this.end);
    this.end.set_block(this.x, this.y + this.start.height + 5, "silver", stage, this, this.start);
  },

  get_start_prev: function() {
    return this.start.prev;
  },

  get_start_next: function() {
    return this.start.next;
  },

  get_end_prev: function() {
    return this.end.prev;
  },

  get_end_next: function() {
    return this.end.next;
  },

  delete: function(node, prev) {
    var prev = this.start.prev;
    this.start.delete();
    this.end.delete();
    node.move(prev);
  },

  most_above: function(stage) {
    stage.addChild(this.start);
    stage.addChild(this.start.n_label);
    stage.addChild(this.end);
  },

  remove_block: function(stage) {
    stage.removeChild(this);
    stage.removeChild(this.start);
    stage.removeChild(this.start.n_label);
    stage.removeChild(this.end);
  },

  loop_move: function() {
    this.x = this.start.x;
    this.y = this.start.y;
  },

  loop_delete: function(node, e) {
    console.log("loop_delete");
    var start_prev = this.start.prev;
    var prev = node.prev;
    var next = node.next;
    if (prev != null && next != null) {
      if (node.type == "loop_start" && next.type == "loop_end") {
        if (next.next != null) {
          next = next.next;
        }
      }
      if (node.type == "loop_end" && prev.type == "loop_start") {
        prev = start_prev;
      }
      if (e.x > prev.x + prev.width + 5 ||
          e.x < prev.x - 5 || e.y < prev.y ||
          e.y > next.y + next.height) {
        this.delete(node, prev);
        return true;
      }
    }
    if (prev != null) {
      if (node.type == "loop_end" && prev.type == "loop_start") {
        prev = start_prev;
      }
      if (e.x > prev.x + prev.width + 5 ||
        e.x < prev.x - 5 || e.y < prev.y) {
          this.delete(node, prev);
          return true;
      } else if (e.x > prev.x + prev.width + 5 ||
        e.x < prev.x - 5 || this.y > prev.y) {
        this.delete(node, prev);
        return true;
      }
    }
    node.move(start_prev);
    return false;
  },

  loop_append: function(stage, e) {
    var prog = stage.prog;
    if (prog.is_x_main_head_inside(e.x)) {
      if (this.is_y_main_head_inside(prog, e.y)) {
        this.loop_move();
        return true;
      }
    }
    if (prog.is_x_s_head_inside(e.x)) {
      if (this.is_y_s_head_inside(prog, e.y)) {
        this.loop_move();
        return true;
      }
    }
    if (prog.is_x_h_head_inside(e.x)) {
      if (this.is_y_h_head_inside(prog, e.y)) {
        this.loop_move();
        return true;
      }
    }
    if (prog.is_x_d_head_inside(e.x)) {
      if (this.is_y_d_head_inside(prog, e.y)) {
        this.loop_move();
        return true;
      }
    }
    if (prog.is_x_c_head_inside(e.x)) {
      if (this.is_y_c_head_inside(prog, e.y)) {
        this.loop_move();
        return true;
      }
    }
    this.remove_block(stage);
    return false;
  },

  is_y_main_head_inside: function(prog, y) {
    if (prog.is_y_main_head_inside(this.start, y)) {
      if (prog.is_y_main_head_inside(this.end, y + this.start.height + 5))
        return true;
      this.start.delete();
    }
    return false;
  },

  is_y_s_head_inside: function(prog, y) {
    if (prog.is_y_s_head_inside(this.start, y)) {
      if (prog.is_y_s_head_inside(this.end, y + this.start.height + 5))
        return true;
      this.start.delete();
    }
    return false;
  },

  is_y_h_head_inside: function(prog, y) {
    if (prog.is_y_h_head_inside(this.start, y)) {
      if (prog.is_y_h_head_inside(this.end, y + this.start.height + 5))
        return true;
      this.start.delete();
    }
    return false;
  },

  is_y_d_head_inside: function(prog, y) {
    if (prog.is_y_d_head_inside(this.start, y)) {
      if (prog.is_y_d_head_inside(this.end, y + this.start.height + 5))
        return true;
      this.start.delete();
    }
    return false;
  },

  is_y_c_head_inside: function(prog, y) {
    if (prog.is_y_c_head_inside(this.start, y)) {
      if (prog.is_y_c_head_inside(this.end, y + this.start.height + 5))
        return true;
      this.start.delete();
    }
    return false;
  },

  loop_addChild: function(stage) {
    stage.addChild(this);
    stage.addChild(this.start);
    stage.addChild(this.start.n_label);
    stage.addChild(this.end);
  },

  register_height: function() {
    this.addEventListener("enterframe", function(e) {
      this.x = this.start.x;
      this.y = this.start.y;
      this.height = (this.end.y + this.end.height) - this.start.y;
    });
  },
});