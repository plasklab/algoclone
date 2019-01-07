var Func_id = enchant.Class.create(Terminal_symbol, {
  initialize: function(name) {
    Terminal_symbol.call(this, "func_id");
    this.name = name;
    this.image = this.set_image();
    // 定義されているargのtypeを保存
    this.arg_type = [];
    // 画面に表示するargを保存
    this.args = [];
  },

  create_block: function(stage, x, y) {
    var fi = new Func_id(this.name);
    fi.set_image(this.image);
    fi.set_x(x);
    fi.set_y(y);
    fi.set_arg_type(this.arg_type);
    fi.set_backgroundColor(this.backgroundColor);
    fi.set_arg(stage);
    fi.register_move(stage);
    fi.register_append(stage);
    fi.register_above(stage);
    return fi;
  },

  copy_block: function(stage, x, y) {
    var fi = new Func_id(this.name);
    fi.set_image(this.image);
    fi.set_x(x);
    fi.set_y(y);
    fi.set_arg_type(this.arg_type);
    fi.set_backgroundColor(this.backgroundColor);
    stage.addChild(fi);
    return fi;
  },

  set_image: function() {
    var img = null;
    if (this.name == "spead")
      img = game.assets[SPEAD];
    else if (this.name == "heart")
      img = game.assets[HEART];
    else if (this.name == "dia")
      img = game.assets[DIA];
    else if (this.name == "clover")
      img = game.assets[CLOVER];
    if (img == null)
      console.log("func_id set_image erorr : " + this.name);
    return img;
  },

  set_arg_type: function(arg_type) {
    this.arg_type = arg_type;
  },

  set_arg: function(stage) {
    var node = this;
    for (var i = 0; i < this.arg_type.length; i++) {
      this.args.push(new Arg(this.arg_type[i], this, node, stage));
      this.args[i].arg_addChild(stage);
      node = this.args[i];
    }
  },

  push_arg_type: function(arg_id) {
    for (var i = 0; i < this.arg_type.length; i++) {
      if (this.arg_type[i] == arg_id)
        return false;
    }
    this.arg_type.push(arg_id);
    return true;
  },

  func_delete: function(e) {
    console.log("func_delete");
    var prev = this.prev;
    var next = this.next;
    if (next != null) {
      while (next.type == "arg_start" || next.type == "arg_end") {
        next = next.next;
        if (next == null) break;
      }
    }
    if (prev != null && next != null) {
      if (e.x > this.keep_x + this.width + 5 ||
          e.x < this.keep_x - 5 || e.y < prev.y ||
          e.y > next.y + next.height) {
        this.delete();
        this.move(prev);
        return true;
      }
    } else if (prev != null) {
      if (e.x > this.keep_x + this.width + 5 ||
          e.x < this.keep_x - 5 || e.y < prev.y) {
        this.delete();
        this.move(prev);
        return true;
      }
    }
    this.move(this);
    return false;
  },

  arg_addChild: function(stage) {
    for (var i = 0; i < this.args.length; i++) {
      stage.addChild(this.args[i].start);
      stage.addChild(this.args[i].end);
    }
  },

  arg_removeChild: function(stage) {
    stage.removeChild(this);
    for (var i = 0; i < this.args.length; i++) {
      this.args[i].arg_removeChild(stage);
    }
  },

  args_append: function() {
    var node = this;
    for (var i = 0; i < this.args.length; i++) {
      this.args[i].arg_append(node);
      node = this.args[i].end;
    }
  },

  args_delete: function(node) {
    for (var i = 0; i < this.args.length; i++) {
      this.args[i].arg_delete(node);
    }
  },

  /* */
  register_init_block_append: function(stage) {
    this.addEventListener("touchend", function(e) {
      console.log("func_id init_block_append : " + this.node.type);
      stage.is_touch = true;
      if (this.node.block_append(stage, e)) {
        this.node.args_append();
        stage.prog.debug();
        return true;
      }
      this.node.arg_removeChild(stage);
      return false;
    })
  },

  register_above: function(stage) {
    this.addEventListener("touchstart", function() {
      if (stage.play_flag) return;
      stage.addChild(this);
      this.arg_addChild(stage);
      this.keep_x = this.x;
      this.keep_y = this.y;
    });
  },

  register_append: function(stage) {
    this.addEventListener("touchend", function(e) {
      if (stage.play_flag) return;
      console.log("func_id append : " + this.type);
      var prev = this.prev;
      if (this.func_delete(e)) {
        this.args_delete(prev);
      } else {
        console.log("false");
        return false;
      }
      if (this.keep_x + this.width + 5 > e.x &&
          this.keep_x - 5 < e.x &&
          this.keep_y + this.height < e.y) {
        e.y -= this.height + 5;
        for (var i = 0; i < this.args.length; i++) {
          e.y -= this.args[i].height;
        }
      }
      if (this.block_append(stage, e)) {
        this.args_append();
        // stage.prog.debug();
        return true;
      }
      this.arg_removeChild(stage);
      return false;
    });
  },

  display: function() {
    console.log("type : " + this.type + " name : " + this.name);
  }
});